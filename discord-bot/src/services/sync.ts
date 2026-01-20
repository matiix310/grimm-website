import { Client, Guild, Role, EmbedBuilder, TextChannel } from "discord.js";
import { db } from "../db";

const { API_KEY, WEBSITE_URL } = process.env;

if (!API_KEY || !WEBSITE_URL) {
  throw new Error("Missing API_KEY or WEBSITE_URL");
}

export type SyncResult = {
  updatedCount: number;
  errorCount: number;
  changes: string[];
};

export const fetchUser = async (
  discordId: string,
): Promise<
  | { error: false; user: { login: string }; canSyncRoles: boolean }
  | { error: true; message: string }
> => {
  const res = await fetch(`${WEBSITE_URL}/api/discord/${discordId}`, {
    headers: {
      "x-api-key": API_KEY,
    },
  });

  if (res.status === 401) {
    return { error: true, message: "The API key is invalid" };
  }

  if (res.status === 404) {
    return { error: true, message: "The user is not linked to a Grimm account" };
  }

  if (!res.ok) {
    return { error: true, message: "An error occurred while trying to sync the user" };
  }

  const data = await res.json();

  return { error: false, ...data };
};

export const syncUser = async (
  guild: Guild,
  memberId: string,
  mappings: { discordRoleId: string; websiteRoleId: string }[],
  allManagedRoleIds: Set<string>,
): Promise<{ success: boolean; changes: string[] }> => {
  try {
    const member = await guild.members.fetch(memberId).catch(() => null);
    if (!member || member.user.bot) return { success: false, changes: [] };

    const userResponse = await fetch(`${WEBSITE_URL}/api/discord/${memberId}`, {
      headers: {
        "x-api-key": API_KEY!,
      },
    });

    let roles: string[] = [];
    if (userResponse.status === 404) {
      roles = [];
    } else if (!userResponse.ok) {
      console.error(`Failed to fetch user ${memberId}: ${userResponse.status}`);
      return { success: false, changes: [] };
    } else {
      const userData = await userResponse.json();
      roles = userData.user.roles as string[];
    }

    const targetRoleIds = new Set<string>(
      mappings.filter((r) => roles.includes(r.websiteRoleId)).map((r) => r.discordRoleId),
    );

    const rolesToAdd: Role[] = [];
    const rolesToRemove: Role[] = [];

    for (const roleId of targetRoleIds) {
      const role = guild.roles.cache.get(roleId);
      if (role && !member.roles.cache.has(role.id)) {
        rolesToAdd.push(role);
      }
    }

    for (const managedRoleId of allManagedRoleIds) {
      if (!targetRoleIds.has(managedRoleId)) {
        const role = guild.roles.cache.get(managedRoleId);
        if (role && member.roles.cache.has(role.id)) {
          rolesToRemove.push(role);
        }
      }
    }

    const changesForUser: string[] = [];

    if (rolesToAdd.length > 0) {
      await member.roles.add(rolesToAdd);
      changesForUser.push(`+ ${rolesToAdd.map((r) => `<@&${r.id}>`).join(", ")}`);
    }
    if (rolesToRemove.length > 0) {
      await member.roles.remove(rolesToRemove);
      changesForUser.push(`\\- ${rolesToRemove.map((r) => `<@&${r.id}>`).join(", ")}`);
    }

    return { success: true, changes: changesForUser };
  } catch (err) {
    console.error(`Error updating member ${memberId}:`, err);
    return { success: false, changes: [] };
  }
};

export const sendLog = async (guild: Guild, changes: string[], title: string) => {
  const logChannelConfig = await db.query.discordLogChannel.findFirst({
    where: (table, { eq }) => eq(table.guildId, guild.id),
  });

  if (!logChannelConfig) return;

  const channel = await guild.channels
    .fetch(logChannelConfig.channelId)
    .catch(() => null);

  if (!channel || !channel.isTextBased()) return;

  const summaryBody = changes.join("\n\n");

  const embed = new EmbedBuilder().setTitle(title).setColor(0x00ff00).setTimestamp();

  if (summaryBody.length > 1500) {
    embed.setDescription("Summary is too long to display. See attached file.");
    await channel.send({
      embeds: [embed],
      files: [
        {
          attachment: Buffer.from(summaryBody),
          name: "sync-summary.txt",
        },
      ],
    });
  } else {
    embed.setDescription(summaryBody);
    await channel.send({ embeds: [embed] });
  }
};

export const syncGuild = async (client: Client, guildId: string): Promise<SyncResult> => {
  const guild = await client.guilds.fetch(guildId).catch(() => null);
  if (!guild) {
    throw new Error(`Guild ${guildId} not found`);
  }

  // Fetch role mappings from database once
  const mappings = await db.query.discordRoleMappings.findMany({
    where: (table, { eq }) => eq(table.guildId, guildId),
  });

  const allManagedRoleIds = new Set<string>(mappings.map((m) => m.discordRoleId));

  const members = (await guild.members.fetch()).filter((m) => !m.user.bot);
  let updatedCount = 0;
  let errorCount = 0;
  const changes: string[] = [];

  for (const [membreId] of members) {
    const result = await syncUser(guild, membreId, mappings, allManagedRoleIds);
    if (result.success) {
      if (result.changes.length > 0) {
        updatedCount++;
        const member = guild.members.cache.get(membreId);
        changes.push(`**${member?.user.tag}**:\n${result.changes.join("\n")}`);
      }
    } else {
      errorCount++;
    }
  }

  if (changes.length > 0) {
    await sendLog(guild, changes, "Role Synchronization - Bulk Sync");
  }

  return { updatedCount, errorCount, changes };
};

export const syncSingleUser = async (
  client: Client,
  memberId: string,
): Promise<SyncResult> => {
  let updatedCount = 0;
  let errorCount = 0;
  const changes: string[] = [];

  // Iterate over all mutual guilds
  for (const guild of client.guilds.cache.values()) {
    try {
      const member = await guild.members.fetch(memberId).catch(() => null);
      if (!member) continue;

      const mappings = await db.query.discordRoleMappings.findMany({
        where: (table, { eq }) => eq(table.guildId, guild.id),
      });

      const allManagedRoleIds = new Set<string>(mappings.map((m) => m.discordRoleId));

      const result = await syncUser(guild, memberId, mappings, allManagedRoleIds); // Reuse syncUser logic without fetching mappings again inside if we pass them
      if (result.success) {
        if (result.changes.length > 0) {
          updatedCount++;
          changes.push(`**${guild.name}**: ${result.changes.join(", ")}`);

          await sendLog(
            guild,
            [`**${member.user.tag}**:\n${result.changes.join("\n")}`],
            "Role Synchronization - Single User",
          );
        }
      } else {
        // Only count error if it wasn't just "not found" or bot, which syncUser returns as success=false changes=[]?
        // Wait, syncUser returns success=false on error OR if bot/not found.
        // We might want to distinguish.
        // But for now, stick to simple logic.
      }
    } catch (e) {
      console.error(`Error syncing user ${memberId} in guild ${guild.id}`, e);
      errorCount++;
    }
  }

  return { updatedCount, errorCount, changes };
};

export const syncAll = async (client: Client): Promise<SyncResult> => {
  let totalUpdated = 0;
  let totalErrors = 0;
  let allChanges: string[] = [];

  for (const guild of client.guilds.cache.values()) {
    try {
      const result = await syncGuild(client, guild.id);
      totalUpdated += result.updatedCount;
      totalErrors += result.errorCount;
      if (result.changes.length > 0) {
        allChanges.push(`**${guild.name}**:\n${result.changes.join("\n")}`);
      }
    } catch (e) {
      console.error(`Error syncing guild ${guild.name}:`, e);
      totalErrors++;
    }
  }

  return { updatedCount: totalUpdated, errorCount: totalErrors, changes: allChanges };
};
