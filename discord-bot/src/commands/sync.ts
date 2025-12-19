import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { db } from "../db";

export default {
  data: new SlashCommandBuilder()
    .setName("sync")
    .setDescription("Synchronize roles")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to synchronize").setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { API_KEY, WEBSITE_URL } = process.env;

    if (!API_KEY || !WEBSITE_URL) {
      await interaction.editReply("Missing API_KEY or WEBSITE_URL");
      return;
    }

    const targetUser = interaction.options.getUser("user");
    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply("Guild not found");
      return;
    }

    const originUser = await fetch(`${WEBSITE_URL}/api/discord/${interaction.user.id}`, {
      headers: {
        "x-api-key": API_KEY,
      },
    });

    if (!originUser.ok) {
      await interaction.editReply("Failed to fetch origin user");
      return;
    }

    const originUserData = await originUser.json();
    if (!originUserData.canSyncRoles) {
      await interaction.editReply("You do not have permission to sync roles");
      return;
    }

    // Fetch role mappings from database once
    const mappings = await db.query.discordRoleMappings.findMany({
      where: (table, { eq }) => eq(table.guildId, interaction.guildId!),
    });

    const allManagedRoleIds = mappings.map((m) => m.discordRoleId);

    let updatedCount = 0;
    let errorCount = 0;
    const changes: string[] = [];

    const updateMember = async (memberId: string) => {
      try {
        const member = await guild.members.fetch(memberId).catch(() => null);
        if (!member || member.user.bot) return;

        const userResponse = await fetch(`${WEBSITE_URL}/api/discord/${memberId}`, {
          headers: {
            "x-api-key": API_KEY,
          },
        });

        let roles: string[] = [];
        if (userResponse.status === 404) {
          roles = [];
        } else if (!userResponse.ok) {
          console.error(`Failed to fetch user ${memberId}: ${userResponse.status}`);
          errorCount++;
          return;
        } else {
          const userData = await userResponse.json();
          roles = userData.user.roles as string[];
        }

        const targetRoleIds = new Set<string>(
          mappings
            .filter((r) => roles.includes(r.websiteRoleId))
            .map((r) => r.discordRoleId)
        );

        const rolesToAdd = [];
        const rolesToRemove = [];

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
          changesForUser.push(`+ ${rolesToAdd.map((r) => r.name).join(", ")}`);
        }
        if (rolesToRemove.length > 0) {
          await member.roles.remove(rolesToRemove);
          changesForUser.push(`\\- ${rolesToRemove.map((r) => r.name).join(", ")}`);
        }

        if (changesForUser.length > 0) {
          changes.push(`**${member.user.tag}**:\n${changesForUser.join("\n")}`);
          updatedCount++;
        }
      } catch (err) {
        console.error(`Error updating member ${memberId}:`, err);
        errorCount++;
      }
    };

    try {
      if (targetUser) {
        // Single user sync
        const userResponse = await fetch(`${WEBSITE_URL}/api/discord/${targetUser.id}`, {
          headers: { "x-api-key": API_KEY },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const login = userData.user.login;

          await fetch(`${WEBSITE_URL}/api/admin/sync-roles/${login}`, {
            method: "POST",
            headers: { "x-api-key": API_KEY },
          });
        }

        await interaction.editReply(`Syncing roles for ${targetUser.tag}...`);
        await updateMember(targetUser.id);
      } else {
        // Bulk sync
        const syncResponse = await fetch(`${WEBSITE_URL}/api/admin/sync-roles`, {
          method: "POST",
          headers: {
            "x-api-key": API_KEY,
          },
        });

        if (!syncResponse.ok) {
          const errorText = await syncResponse.text();
          await interaction.editReply(
            `Failed to trigger website sync: ${syncResponse.status} ${errorText}`
          );
          return;
        }

        await interaction.editReply("Website sync triggered. Updating Discord roles...");

        const members = await guild.members.fetch();
        for (const [id] of members) {
          await updateMember(id);
        }
      }

      const summaryBody = changes.join("\n\n");

      const embed = new EmbedBuilder()
        .setTitle("Role Synchronization" + (targetUser ? ` for ${targetUser.tag}` : ""))
        .setColor(errorCount === 0 ? 0x00ff00 : 0xffa500)
        .addFields(
          { name: "Updated Members", value: updatedCount.toString(), inline: true },
          { name: "Errors", value: errorCount.toString(), inline: true }
        )
        .setTimestamp();

      if (summaryBody.length > 4000) {
        embed.setDescription("Summary is too long to display. See attached file.");
        await interaction.editReply({
          content: "",
          embeds: [embed],
          files: [
            {
              attachment: Buffer.from(summaryBody),
              name: "sync-summary.txt",
            },
          ],
        });
      } else if (summaryBody.length > 0) {
        embed.setDescription(summaryBody);
        await interaction.editReply({ content: "", embeds: [embed] });
      } else {
        embed.setDescription("No changes made.");
        await interaction.editReply({ content: "", embeds: [embed] });
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply("An error occurred during synchronization.");
    }
  },
};
