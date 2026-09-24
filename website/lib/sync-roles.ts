import { db } from "@/db";
import { account, user } from "@/db/schema/auth";
import { eq, and } from "drizzle-orm";
import { getUserAuthentikGroups } from "./authentik";
import { getEnvOrThrow, getEnv } from "./env";
import { sendDiscordNotification } from "./discord";

// Discord limits (for chunking long content)
const DISCORD_EMBED_FIELD_VALUE_LIMIT = 1024;
const DISCORD_EMBED_TOTAL_LIMIT = 6000;
const DISCORD_MAX_EMBEDS_PER_MESSAGE = 10;
const DISCORD_TRIMMED_LOGIN_NAMES = 10;

function chunkDiscordString(content: string, limit: number): string[] {
  if (content.length <= limit) return [content];
  const chunks: string[] = [];
  for (let i = 0; i < content.length; i += limit) {
    chunks.push(content.slice(i, i + limit));
  }
  return chunks;
}

function trimLoginList(logins: string[], maxNames = DISCORD_TRIMMED_LOGIN_NAMES): string {
  if (logins.length <= maxNames) return logins.join(", ");
  const shown = logins.slice(0, maxNames).join(", ");
  const remaining = logins.length - maxNames;
  return `${shown} (+${remaining} more)`;
}

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
  await sendDiscordNotification("Scheduled Bulk Role Sync", "Role sync started", "info");

  try {
    const allUsers = await db.query.user.findMany({
      columns: { id: true, login: true, role: true },
    });

    const loginToRolesMap = new Map<string, string[]>();
    const skippedLogins: Array<{ login: string; reason: string }> = [];

    for (const u of allUsers) {
      try {
        const groups = await getUserAuthentikGroups(u.login);
        loginToRolesMap.set(u.login, groups);
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
        await db.update(user).set({ role: newRoleString }).where(eq(user.login, u.login));
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

    if (discordWebhook) {
      try {
        const serverUrl = getEnv("BASE_URL") || "Unknown Server";

        // Build full lists — no artificial max
        const fullChangesText = changes
          .map(
            (change) =>
              `**${change.login}**: \`${change.from.join(", ")}\` => \`${change.to.join(
                ", ",
              )}\``,
          )
          .join("\n");
        const fullSkippedText = skippedLogins
          .map((s) => `**${s.login}**: ${s.reason}`)
          .join("\n");

        const summaryValue = `**Updated:** ${updatedCount}\n**Cleared:** ${clearedCount}\n**Total Affected:** ${
          updatedCount + clearedCount
        }`;

        interface EmbedRecord {
          title: string;
          description?: string;
          color: number;
          fields: Array<{ name: string; value: string; inline?: boolean }>;
          timestamp?: string;
          footer?: { text: string };
        }
        const embeds: EmbedRecord[] = [];

        // Decide if everything fits in one embed or needs splitting
        const baseOverhead =
          summaryValue.length + (serverUrl.length + 50) + (message.length + 50) + 200;
        const fullSize =
          baseOverhead +
          (changes.length > 0 ? fullChangesText.length : 0) +
          (skippedLogins.length > 0 ? fullSkippedText.length + 50 : 0);

        if (changes.length === 0 && skippedLogins.length === 0) {
          // Single summary-only embed (no changes / skipped sections needed)
          embeds.push({
            title: "Scheduled Bulk Role Sync",
            description: message,
            color: 0x00ff00,
            fields: [
              { name: "Summary", value: summaryValue, inline: true },
              { name: "Server", value: serverUrl, inline: true },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "Role Sync System" },
          });
        } else if (fullSize <= DISCORD_EMBED_TOTAL_LIMIT) {
          // Single embed, all fields inline
          const fields: EmbedRecord["fields"] = [
            { name: "Summary", value: summaryValue, inline: true },
            { name: "Server", value: serverUrl, inline: true },
          ];
          if (changes.length > 0) {
            fields.push({ name: "Changes", value: fullChangesText, inline: false });
          }
          if (skippedLogins.length > 0) {
            fields.push({
              name: "⚠️ Skipped (Authentik API errors)",
              value: fullSkippedText,
              inline: false,
            });
          }
          embeds.push({
            title: "Scheduled Bulk Role Sync",
            description: message,
            color: 0x00ff00,
            fields,
            timestamp: new Date().toISOString(),
            footer: { text: "Role Sync System" },
          });
        } else {
          // Split: first embed has the summary, subsequent embeds continue
          let first = true;
          if (changes.length > 0) {
            const changeChunks = chunkDiscordString(
              fullChangesText,
              DISCORD_EMBED_FIELD_VALUE_LIMIT,
            );
            for (const chunk of changeChunks) {
              embeds.push({
                title: first
                  ? "Scheduled Bulk Role Sync — Changes"
                  : "Changes (continued)",
                description: first ? message : "Continued from previous message",
                color: 0x00ff00,
                fields: first
                  ? [
                      { name: "Summary", value: summaryValue, inline: true },
                      { name: "Server", value: serverUrl, inline: true },
                      { name: "Changes", value: chunk, inline: false },
                    ]
                  : [{ name: "Changes (continued)", value: chunk, inline: false }],
                timestamp: first ? new Date().toISOString() : undefined,
                footer: first ? { text: "Role Sync System" } : undefined,
              });
              first = false;
            }
          }
          if (skippedLogins.length > 0) {
            const skippedChunks = chunkDiscordString(
              fullSkippedText,
              DISCORD_EMBED_FIELD_VALUE_LIMIT,
            );
            for (const chunk of skippedChunks) {
              embeds.push({
                title: first
                  ? "Scheduled Bulk Role Sync — Skipped"
                  : "Skipped (continued)",
                description: first ? message : "Continued from previous message",
                color: 0xff9900,
                fields: first
                  ? [
                      { name: "Summary", value: summaryValue, inline: true },
                      { name: "Server", value: serverUrl, inline: true },
                      {
                        name: "⚠️ Skipped (Authentik API errors)",
                        value: chunk,
                        inline: false,
                      },
                    ]
                  : [{ name: "⚠️ Skipped (continued)", value: chunk, inline: false }],
                timestamp: first ? new Date().toISOString() : undefined,
                footer: first ? { text: "Role Sync System" } : undefined,
              });
              first = false;
            }
          }
          // If we had no changes and no skipped entries earlier, the embed is empty — guard:
          if (embeds.length === 0) {
            embeds.push({
              title: "Scheduled Bulk Role Sync",
              description: message,
              color: 0x00ff00,
              fields: [
                { name: "Summary", value: summaryValue, inline: true },
                { name: "Server", value: serverUrl, inline: true },
              ],
              timestamp: new Date().toISOString(),
              footer: { text: "Role Sync System" },
            });
          }
        }

        // Webhook accepts up to 10 embeds per message — batch if needed
        for (let i = 0; i < embeds.length; i += DISCORD_MAX_EMBEDS_PER_MESSAGE) {
          const batch = embeds.slice(i, i + DISCORD_MAX_EMBEDS_PER_MESSAGE);
          await fetch(discordWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: batch }),
          });
        }
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

    // Always send a summary line — covers the no-changes case too
    const summaryLine = hasActivity
      ? message
      : `Bulk sync completed. No role changes.${
          skippedLogins.length > 0
            ? ` ${skippedLogins.length} user(s) skipped due to Authentik API errors.`
            : ""
        }`;
    await sendDiscordNotification("Scheduled Bulk Role Sync", summaryLine, "success");

    // Separate trimmed notification for skipped users
    if (skippedLogins.length > 0) {
      const skippedLoginsText = trimLoginList(skippedLogins.map((s) => s.login));
      await sendDiscordNotification(
        "Scheduled Bulk Role Sync",
        `${skippedLogins.length} user(s) skipped due to Authentik API errors: ${skippedLoginsText}`,
        "error",
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

    const newRoles = await getUserAuthentikGroups(login);

    const existingRoles = existing.role
      ? existing.role
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean)
      : [];

    const newRoleString = newRoles.toSorted().join(",");
    const currentRoleString = existingRoles.toSorted().join(",");

    if (currentRoleString !== newRoleString) {
      await db.update(user).set({ role: newRoleString }).where(eq(user.login, login));
    }

    const discordUrl = process.env.DISCORD_URL;
    if (discordUrl) {
      const discordAccount = await db.query.account.findFirst({
        where: and(eq(account.userId, existing.id), eq(account.providerId, "discord")),
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
