import { db } from "@/db";
import { account, user } from "@/db/schema/auth";
import { Roles } from "@/lib/auth";
import { eq, inArray, isNotNull, notInArray, and } from "drizzle-orm";
import { getUserGroups } from "./google-workspace";
import { getEnvOrThrow, getEnv } from "./env";
import { sendDiscordNotification } from "./discord";

// Role mapping from Google Workspace group names to internal role names
const roleMapping: Record<string, Roles> = {
  // Bureau
  "039kk8xu21d4a3b": "bureau",

  // Respos
  "01baon6m0qidpje": "respoTech",
  "04h042r0370z0tg": "respoDesign",
  "03ygebqi3q37nt0": "respoCom",
  "0319y80a310l5zi": "respoAssistants",
  "00haapch40qlumk": "respoWei",
  "00sqyw6430eht6k": "respoInter",
  "023ckvvd4dvekl0": "respoVJ",
  "00ihv6360tmquq0": "respoEvent",
  "00kgcv8k1056q0k": "respoMerch",

  // Teams
  "02grqrue40zqwes": "teamTech",
  "03oy7u290m4e7u8": "teamDesign",
  "02ce457m0s4ds2f": "teamCom",
  "03ygebqi2n0ytbi": "teamEvent",

  // Members
  "00meukdy1c1yrhk": "member",

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
  const serviceAccountEmail = getEnvOrThrow("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = getEnvOrThrow("GOOGLE_PRIVATE_KEY");

  if (!serviceAccountEmail || !privateKey) {
    await sendDiscordNotification(
      "Scheduled Bulk Role Sync",
      "Missing Google Workspace credentials",
      "error",
    );
    return { success: false, message: "Missing Google Workspace credentials" };
  }

  await sendDiscordNotification("Scheduled Bulk Role Sync", "Role sync started", "info");

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
        serviceAccountEmail,
        privateKey,
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
            (r: string) => r === "user" || r === "admin",
          );

          // Build new role set: preserved roles + new roles from workspace
          const finalRoles = [...new Set([...preservedRoles, ...newRoles])];

          // Only update if different
          const newRoleString = finalRoles.toSorted().join(",");
          const currentRoleString =
            existingUser.role?.split(",").toSorted().join(",") || "";

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
        notInArray(user.login, logins.length > 0 ? logins : [""]),
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
          (r: string) => r === "user" || r === "admin",
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

    let message = `Synced ${updatedCount} users.`;
    if (clearedCount > 0) {
      message += ` Cleared ${clearedCount} users not in workspace.`;
    }
    if (errors.length > 0) {
      message += ` Errors: ${errors.length}.`;
    }

    // Send Discord webhook notification
    const discordWebhook = getEnvOrThrow("DISCORD_ROLE_SYNC_WEBHOOK_URL");
    if (discordWebhook && (updatedCount > 0 || clearedCount > 0)) {
      try {
        const serverUrl = getEnv("BASE_URL") || "Unknown Server";

        // Build changes list (limit to avoid Discord message size limits)
        const maxChanges = 10;
        const changesList = changes
          .slice(0, maxChanges)
          .map(
            (change) =>
              `**${change.login}**: \`${change.from.join(", ")}\` => \`${change.to.join(
                ", ",
              )}\``,
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
          title: "Scheduled Bulk Role Sync",
          description: message,
          color: 0x00ff00,
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

    if (errors.length > 0) {
      await sendDiscordNotification(
        "Scheduled Bulk Role Sync",
        "The following errors occurred:\n" + errors.join("\n"),
        "error",
      );
    }

    if (updatedCount === 0 && clearedCount === 0) {
      await sendDiscordNotification(
        "Scheduled Bulk Role Sync",
        "No changes occurred.",
        "success",
      );
    }

    const discordUrl = process.env.DISCORD_URL;

    if (discordUrl) {
      await fetch(`${discordUrl}/sync`);
    }

    return {
      success: true,
      message,
      details: { updated: updatedCount, cleared: clearedCount, errors, changes },
    };
  } catch (error) {
    console.error("Sync failed:", error);
    await sendDiscordNotification(
      "Scheduled Bulk Role Sync",
      "Sync failed, see console for more details",
      "error",
    );
    return { success: false, message: "Failed to sync roles" };
  }
}

export async function performUserRoleSync(login: string): Promise<SyncRolesResult> {
  const serviceAccountEmail = getEnvOrThrow("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = getEnvOrThrow("GOOGLE_PRIVATE_KEY");

  if (!serviceAccountEmail || !privateKey) {
    await sendDiscordNotification(
      "Scheduled User Role Sync [" + login + "]",
      "Missing Google Workspace credentials",
      "error",
    );
    return { success: false, message: "Missing Google Workspace credentials" };
  }

  await sendDiscordNotification(
    "Scheduled User Role Sync [" + login + "]",
    "Role sync started for user " + login,
    "info",
  );

  try {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.login, login))
      .leftJoin(
        account,
        and(eq(account.userId, user.id), eq(account.providerId, "google")),
      )
      .limit(1);

    if (result.length === 0) {
      await sendDiscordNotification(
        "Scheduled User Role Sync [" + login + "]",
        "User " + login + " not found",
        "error",
      );
      return { success: false, message: `User ${login} not found` };
    }

    const { user: existingUser, account: googleAccount } = result[0];

    if (!googleAccount) {
      await sendDiscordNotification(
        "Scheduled User Role Sync [" + login + "]",
        "User " + login + " does not have a Google account linked",
        "error",
      );
      return {
        success: false,
        message: `User ${login} does not have a Google account linked`,
      };
    }

    const roles = await getUserGroups(
      googleAccount.accountId,
      serviceAccountEmail,
      privateKey,
    );

    const newRoles: Roles[] = [];
    for (const roleString of roles) {
      if (roleString in roleMapping) newRoles.push(roleMapping[roleString]);
    }

    // Parse existing roles
    const existingRoles = existingUser.role
      ? existingUser.role
          .split(",")
          .map((r: string) => r.trim())
          .filter(Boolean)
      : [];

    // Preserve user and admin roles
    const preservedRoles = existingRoles.filter(
      (r: string) => r === "user" || r === "admin",
    );

    // Build new role set
    const finalRoles = [...new Set([...preservedRoles, ...newRoles])];

    const newRoleString = finalRoles.toSorted().join(",");
    const currentRoleString = existingUser.role?.split(",").toSorted().join(",") || "";

    if (currentRoleString !== newRoleString) {
      await db.update(user).set({ role: newRoleString }).where(eq(user.login, login));
    }

    // update the discord user if any
    const discordUrl = process.env.DISCORD_URL;

    if (discordUrl) {
      const discordAccount = await db.query.account.findFirst({
        where: and(
          eq(account.userId, existingUser.id),
          eq(account.providerId, "discord"),
        ),
      });

      if (discordAccount) {
        await fetch(`${discordUrl}/sync/${discordAccount.accountId}`);
      }
    }

    if (currentRoleString !== newRoleString) {
      await sendDiscordNotification(
        "Scheduled User Role Sync [" + login + "]",
        "Synced roles for user " +
          login +
          "\nFrom: `" +
          existingRoles.join(", ") +
          "`\nTo: `" +
          finalRoles.join(", ") +
          "`",
        "success",
      );

      return {
        success: true,
        message: `Synced roles for user ${login}`,
        details: {
          updated: 1,
          cleared: 0,
          errors: [],
          changes: [
            {
              login,
              from: existingRoles,
              to: finalRoles,
            },
          ],
        },
      };
    }

    await sendDiscordNotification(
      "Scheduled User Role Sync [" + login + "]",
      "No changes for user " + login,
      "success",
    );

    return {
      success: true,
      message: `No changes for user ${login}`,
      details: {
        updated: 0,
        cleared: 0,
        errors: [],
        changes: [],
      },
    };
  } catch (error) {
    console.error(`Sync failed for user ${login}:`, error);
    return { success: false, message: `Failed to sync roles for user ${login}` };
  }
}
