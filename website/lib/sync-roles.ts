import { db } from "@/db";
import { account, user } from "@/db/schema/auth";
import { Roles } from "@/lib/auth";
import { eq, inArray, isNotNull, notInArray, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUserGroups } from "./google-workspace";

// Role mapping from Google Workspace group names to internal role names
const roleMapping: Record<string, Roles> = {
  // Bureau
  bureau: "bureau",

  // Respos
  "01baon6m0qidpje": "respoTech",
  "respo design": "respoDesign",
  "respo com": "respoCom",
  "respo assistants": "respoAssistants",
  "00haapch40qlumk": "respoWei",
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

export interface SyncRolesResult {
  success: boolean;
  message: string;
  details?: {
    updated: number;
    cleared: number;
    errors: string[];
    changes: Array<{ login: string; from: string[]; to: string[] }>;
  };
}

export async function performRoleSync(): Promise<SyncRolesResult> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!serviceAccountEmail || !privateKey) {
    return { success: false, message: "Missing Google Workspace credentials" };
  }

  try {
    const loginToRolesMap = new Map<string, { newRoles: Roles[] }>();

    const accounts = await db
      .select()
      .from(account)
      .where(eq(account.providerId, "google"))
      .innerJoin(user, eq(account.userId, user.id));

    for (const account of accounts) {
      const login = account.user.login;

      const roles = await getUserGroups(
        account.account.accountId,
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        process.env.GOOGLE_PRIVATE_KEY!
      );

      const newRoles: Roles[] = [];

      for (const roleString of roles) {
        if (roleString in roleMapping) newRoles.push(roleMapping[roleString]);
      }

      loginToRolesMap.set(login, { newRoles });
    }

    const logins = Array.from(loginToRolesMap.keys());

    let updatedCount = 0;
    const errors: string[] = [];
    const changes: Array<{ login: string; from: string[]; to: string[] }> = [];

    if (logins.length !== 0) {
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

      // Process updates
      for (const [login, { newRoles }] of loginToRolesMap.entries()) {
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

          // Build new role set: preserved roles + new roles from workspace
          const finalRoles = [...new Set([...preservedRoles, ...newRoles])];

          // Only update if different
          const newRoleString = finalRoles.join(",");
          const currentRoleString = existingUser.role || "";

          if (currentRoleString !== newRoleString) {
            await db
              .update(user)
              .set({ role: newRoleString })
              .where(eq(user.login, login));
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
    }

    // Clean up users not in the Google Workspace
    // Fetch only users NOT in the workspace who have roles
    const usersNotInWorkspace = await db.query.user.findMany({
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

    for (const dbUser of usersNotInWorkspace) {
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
      message += ` Cleared ${clearedCount} users not in workspace.`;
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
      details: { updated: updatedCount, cleared: clearedCount, errors, changes },
    };
  } catch (error) {
    console.error("Sync failed:", error);
    return { success: false, message: "Failed to sync roles" };
  }
}
