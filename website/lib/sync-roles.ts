import { db } from "@/db";
import { account, user } from "@/db/schema/auth";
import { Roles } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { getUserAuthentikGroups } from "./authentik";
import { getEnvOrThrow, getEnv } from "./env";
import { sendDiscordNotification } from "./discord";

const ADMIN_GROUP = "website-admin";

// Role mapping from Authentik group names to internal role names
const roleMapping: Record<string, Roles> = {
  bureau: "bureau",

  "respo-tech": "respoTech",
  "respo-design": "respoDesign",
  "respo-com": "respoCom",
  "respo-assistants": "respoAssistants",
  "respo-wei": "respoWei",
  "respo-inter": "respoInter",
  "respo-vj": "respoVJ",
  "respo-event": "respoEvent",
  "respo-merch": "respoMerch",
  "respo-part": "respoPart",
  "respo-treso": "respoTreso",

  "team-tech": "teamTech",
  "team-design": "teamDesign",
  "team-com": "teamCom",
  "team-event": "teamEvent",
  "team-part": "teamPart",
  "team-treso": "teamTreso",

  member: "member",
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

function computeRoles(groups: string[]): Roles[] {
  const mapped = groups
    .map((g) => roleMapping[g])
    .filter((r): r is Roles => Boolean(r));
  const finalSet = new Set<Roles>(["user", ...mapped]);
  if (groups.includes(ADMIN_GROUP)) finalSet.add("admin");
  return Array.from(finalSet);
}

export async function performRoleSync(): Promise<SyncRolesResult> {
  await sendDiscordNotification(
    "Scheduled Bulk Role Sync",
    "Role sync started",
    "info",
  );

  try {
    const allUsers = await db.query.user.findMany({
      columns: { id: true, login: true, role: true },
    });

    const loginToRolesMap = new Map<string, Roles[]>();
    const skippedLogins: Array<{ login: string; reason: string }> = [];

    for (const u of allUsers) {
      try {
        const groups = await getUserAuthentikGroups(u.login);
        loginToRolesMap.set(u.login, computeRoles(groups));
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        console.error(`Failed to fetch Authentik groups for ${u.login}:`, err);
        skippedLogins.push({ login: u.login, reason });
      }
    }

    let updatedCount = 0;
    let clearedCount = 0;
    const errors: string[] = [];
    const changes: Array<{ login: string; from: string[]; to: string[] }> = [];

    for (const u of allUsers) {
      const newRoles = loginToRolesMap.get(u.login);
      if (!newRoles) continue;

      const existingRoles = u.role
        ? u.role
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean)
        : [];

      const newRoleString = newRoles.toSorted().join(",");
      const currentRoleString = existingRoles.toSorted().join(",");

      if (currentRoleString === newRoleString) continue;

      const isDemotion = existingRoles.length > newRoles.length;

      try {
        await db
          .update(user)
          .set({ role: newRoleString })
          .where(eq(user.login, u.login));
        if (isDemotion) clearedCount++;
        else updatedCount++;
        changes.push({ login: u.login, from: existingRoles, to: newRoles });
      } catch (err) {
        console.error(`Failed to update user ${u.login}:`, err);
        errors.push(`Failed to update ${u.login}`);
      }
    }

    let message = `Synced ${updatedCount} users. Cleared ${clearedCount} users.`;
    if (skippedLogins.length > 0) {
      message += ` Skipped ${skippedLogins.length} due to API errors.`;
    }
    if (errors.length > 0) {
      message += ` Errors: ${errors.length}.`;
    }

    const discordWebhook = getEnvOrThrow("DISCORD_ROLE_SYNC_WEBHOOK_URL");
    const hasActivity = updatedCount > 0 || clearedCount > 0;

    if (discordWebhook && hasActivity) {
      try {
        const serverUrl = getEnv("BASE_URL") || "Unknown Server";

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
          { name: "Server", value: serverUrl, inline: true },
        ];
        if (changes.length > 0) {
          fields.push({
            name: "Changes",
            value: changesList + moreChanges,
            inline: false,
          });
        }
        if (skippedLogins.length > 0) {
          const skippedList = skippedLogins
            .slice(0, maxChanges)
            .map((s) => `**${s.login}**: ${s.reason}`)
            .join("\n");
          const moreSkipped =
            skippedLogins.length > maxChanges
              ? `\n...and ${skippedLogins.length - maxChanges} more`
              : "";
          fields.push({
            name: "⚠️ Skipped (Authentik API errors)",
            value: skippedList + moreSkipped,
            inline: false,
          });
        }

        const embed = {
          title: "Scheduled Bulk Role Sync",
          description: message,
          color: 0x00ff00,
          fields,
          timestamp: new Date().toISOString(),
          footer: { text: "Role Sync System" },
        };

        await fetch(discordWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embeds: [embed] }),
        });
      } catch (err) {
        console.error("Failed to send Discord notification:", err);
      }
    }

    if (errors.length > 0) {
      await sendDiscordNotification(
        "Scheduled Bulk Role Sync",
        "The following errors occurred:\n" + errors.join("\n"),
        "error",
      );
    }

    if (!hasActivity && skippedLogins.length === 0) {
      await sendDiscordNotification(
        "Scheduled Bulk Role Sync",
        "No changes occurred.",
        "success",
      );
    }

    if (skippedLogins.length > 0) {
      await sendDiscordNotification(
        "Scheduled Bulk Role Sync",
        `Skipped ${skippedLogins.length} user(s) due to Authentik API errors: ${skippedLogins.map((s) => s.login).join(", ")}`,
        "error",
      );
    }

    const discordUrl = process.env.DISCORD_URL;
    if (discordUrl) {
      // TODO: re-enable when ready to push role changes to Discord
      // await fetch(`${discordUrl}/sync`);
      console.log("[role-sync] Discord bot call skipped (commented out)");
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

export async function performUserRoleSync(
  login: string,
): Promise<SyncRolesResult> {
  await sendDiscordNotification(
    "Scheduled User Role Sync [" + login + "]",
    "Role sync started for user " + login,
    "info",
  );

  try {
    const existing = await db.query.user.findFirst({
      where: eq(user.login, login),
      columns: { id: true, login: true, role: true },
    });

    if (!existing) {
      await sendDiscordNotification(
        "Scheduled User Role Sync [" + login + "]",
        "User " + login + " not found",
        "error",
      );
      return { success: false, message: `User ${login} not found` };
    }

    const groups = await getUserAuthentikGroups(login);
    const newRoles = computeRoles(groups);

    const existingRoles = existing.role
      ? existing.role
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean)
      : [];

    const newRoleString = newRoles.toSorted().join(",");
    const currentRoleString = existingRoles.toSorted().join(",");

    if (currentRoleString !== newRoleString) {
      await db
        .update(user)
        .set({ role: newRoleString })
        .where(eq(user.login, login));
    }

    const discordUrl = process.env.DISCORD_URL;
    if (discordUrl) {
      const discordAccount = await db.query.account.findFirst({
        where: and(
          eq(account.userId, existing.id),
          eq(account.providerId, "discord"),
        ),
      });
      if (discordAccount) {
        // TODO: re-enable when ready to push role changes to Discord
        // await fetch(`${discordUrl}/sync/${discordAccount.accountId}`);
        console.log(`[role-sync] Discord bot call skipped for ${login} (commented out)`);
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
          newRoles.join(", ") +
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
          changes: [{ login, from: existingRoles, to: newRoles }],
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
      details: { updated: 0, cleared: 0, errors: [], changes: [] },
    };
  } catch (error) {
    console.error(`Sync failed for user ${login}:`, error);
    return { success: false, message: `Failed to sync roles for user ${login}` };
  }
}