import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { getSheetData } from "@/lib/google-sheets";
import { Roles } from "@/lib/auth";
import { eq, inArray, isNotNull, notInArray, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Role mapping from Google Sheet names to internal role names
const roleMapping: Record<string, Roles> = {
  // Bureau
  bureau: "bureau",

  // Respos
  "respo tech": "respoTech",
  "respo design": "respoDesign",
  "respo com": "respoCom",
  "respo assistants": "respoAssistants",
  "respo wei": "respoWei",
  "respo inter": "respoInter",
  "respo vj": "respoVJ",

  // Teams
  "team tech": "teamTech",
  "team design": "teamDesign",
  "team com": "teamCom",

  // Members
  membre: "member",

  // Staff
  staff: "staff",
};

function mapRole(roleStr: string): Roles | null {
  const normalized = roleStr.toLowerCase().trim();
  return roleMapping[normalized] || null;
}

export interface SyncRolesResult {
  success: boolean;
  message: string;
  details?: {
    updated: number;
    cleared: number;
    skipped: string[];
    errors: string[];
    changes: Array<{ login: string; from: string[]; to: string[] }>;
  };
}

export async function performRoleSync(): Promise<SyncRolesResult> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!sheetId || !serviceAccountEmail || !privateKey) {
    return { success: false, message: "Missing Google Sheets credentials" };
  }

  try {
    // Fetch data from the first sheet
    const data = await getSheetData(sheetId, "A:C", serviceAccountEmail, privateKey);

    if (!data || data.length === 0) {
      return { success: false, message: "No data found in Google Sheet" };
    }

    // Skip header row and parse all rows
    const rows = data.slice(1);

    // First pass: collect all logins and parse roles from sheet
    const loginToRolesMap = new Map<
      string,
      { newRoles: Roles[]; unknownRoles: string[] }
    >();
    const skipped: string[] = [];

    for (const row of rows) {
      const login = row[0]?.trim();
      const roleStr = row[2]?.trim();

      if (!login || !roleStr) continue;

      // Parse multiple roles from Google Sheet (comma-separated)
      const sheetRoleStrings = roleStr
        .split(",")
        .map((r: string) => r.trim())
        .filter(Boolean);

      // Map each role to internal role name
      const newRoles: Roles[] = [];
      const unknownRoles: string[] = [];

      for (const roleString of sheetRoleStrings) {
        const mappedRole = mapRole(roleString);
        if (mappedRole) {
          newRoles.push(mappedRole);
        } else {
          unknownRoles.push(roleString);
        }
      }

      // Skip if no valid roles found
      if (newRoles.length === 0) {
        skipped.push(`${login} (unknown roles: "${roleStr}")`);
        continue;
      }

      if (newRoles.length > 0) {
        loginToRolesMap.set(login, { newRoles, unknownRoles });
      }
    }

    const logins = Array.from(loginToRolesMap.keys());

    if (logins.length === 0) {
      return { success: false, message: "No valid users found in Google Sheet" };
    }

    // Fetch all users in one query
    const users = await db.query.user.findMany({
      where: inArray(user.login, logins),
      columns: {
        id: true,
        login: true,
        role: true,
      },
    });

    // Build a map of users by login for quick lookup
    const userMap = new Map(users.map((u) => [u.login, u]));

    let updatedCount = 0;
    const errors: string[] = [];
    const changes: Array<{ login: string; from: string[]; to: string[] }> = [];

    // Process updates
    for (const [login, { newRoles, unknownRoles }] of loginToRolesMap.entries()) {
      // Log unknown roles but continue with valid ones
      if (unknownRoles.length > 0) {
        console.warn(`User ${login}: Unknown roles skipped: ${unknownRoles.join(", ")}`);
      }

      const existingUser = userMap.get(login);

      if (!existingUser) {
        // User not found in database, skip this user
        continue;
      }

      try {
        // Parse existing roles (comma-separated)
        const existingRoles = existingUser.role
          ? existingUser.role
              .split(",")
              .map((r: string) => r.trim())
              .filter(Boolean)
          : [];

        // Preserve user and admin roles
        const preservedRoles = existingRoles.filter(
          (r: string) => r === "user" || r === "admin"
        );

        // Build new role set: preserved roles + new roles from sheet
        const finalRoles = [...new Set([...preservedRoles, ...newRoles])];

        // Only update if different
        const newRoleString = finalRoles.join(",");
        const currentRoleString = existingUser.role || "";

        if (currentRoleString !== newRoleString) {
          await db.update(user).set({ role: newRoleString }).where(eq(user.login, login));
          updatedCount++;
          changes.push({
            login,
            from: existingRoles,
            to: finalRoles,
          });
        }
      } catch (err) {
        console.error(`Failed to update user ${login}:`, err);
        errors.push(`Failed to update ${login}`);
      }
    }

    // Clean up users not in the Google Sheet
    // Fetch only users NOT in the sheet who have roles
    const usersNotInSheet = await db.query.user.findMany({
      where: and(
        isNotNull(user.role),
        notInArray(user.login, logins.length > 0 ? logins : [""])
      ),
      columns: {
        id: true,
        login: true,
        role: true,
      },
    });

    let clearedCount = 0;

    for (const dbUser of usersNotInSheet) {
      // Skip users with null or empty roles
      if (!dbUser.role) {
        continue;
      }

      try {
        // Parse existing roles
        const existingRoles = dbUser.role
          .split(",")
          .map((r: string) => r.trim())
          .filter(Boolean);

        // Keep only user and admin roles
        const preservedRoles = existingRoles.filter(
          (r: string) => r === "user" || r === "admin"
        );

        // Only update if there were organizational roles to remove
        if (preservedRoles.length < existingRoles.length) {
          const newRoleString =
            preservedRoles.length > 0 ? preservedRoles.join(",") : "user";

          await db
            .update(user)
            .set({ role: newRoleString })
            .where(eq(user.login, dbUser.login));
          clearedCount++;
          changes.push({
            login: dbUser.login,
            from: existingRoles,
            to: preservedRoles.length > 0 ? preservedRoles : ["user"],
          });
        }
      } catch (err) {
        console.error(`Failed to clear roles for user ${dbUser.login}:`, err);
        errors.push(`Failed to clear ${dbUser.login}`);
      }
    }

    revalidatePath("/admin/users");

    let message = `Synced ${updatedCount} users.`;
    if (clearedCount > 0) {
      message += ` Cleared ${clearedCount} users not in sheet.`;
    }
    if (skipped.length > 0) {
      message += ` Skipped ${skipped.length} (unknown roles).`;
    }
    if (errors.length > 0) {
      message += ` Errors: ${errors.length}.`;
    }

    // Send Discord webhook notification
    const discordWebhook = process.env.DISCORD_ROLE_SYNC_WEBHOOK_URL;
    console.log(discordWebhook);
    if (discordWebhook && (updatedCount > 0 || clearedCount > 0)) {
      try {
        const serverUrl = process.env.BASE_URL || "Unknown Server";

        // Build changes list (limit to avoid Discord message size limits)
        const maxChanges = 10;
        const changesList = changes
          .slice(0, maxChanges)
          .map(
            (change) =>
              `**${change.login}**: \`${change.from.join(", ")}\` => \`${change.to.join(
                ", "
              )}\``
          )
          .join("\n");

        const moreChanges =
          changes.length > maxChanges
            ? `\n...and ${changes.length - maxChanges} more`
            : "";

        const fields = [
          {
            name: "Summary",
            value: `**Updated:** ${updatedCount}\n**Cleared:** ${clearedCount}\n**Total Affected:** ${
              updatedCount + clearedCount
            }`,
            inline: true,
          },
          {
            name: "Server",
            value: serverUrl,
            inline: true,
          },
        ];

        // Add changes field if there are any
        if (changes.length > 0) {
          fields.push({
            name: "Changes",
            value: changesList + moreChanges,
            inline: false,
          });
        }

        const embed = {
          title: "Roles Synced",
          description: message,
          color: 0x4ca66e, // Green color
          fields,
          timestamp: new Date().toISOString(),
          footer: {
            text: "Role Sync System",
          },
        };

        await fetch(discordWebhook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            embeds: [embed],
          }),
        });
      } catch (err) {
        console.error("Failed to send Discord notification:", err);
        // Don't fail the sync if Discord notification fails
      }
    }

    return {
      success: true,
      message,
      details: { updated: updatedCount, cleared: clearedCount, skipped, errors, changes },
    };
  } catch (error) {
    console.error("Sync failed:", error);
    return { success: false, message: "Failed to sync roles" };
  }
}
