import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { fetchUser } from "../services/sync";

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

    // check that the user has the permission to sync roles
    const originUser = await fetchUser(interaction.user.id);

    if (originUser.error) {
      await interaction.editReply(originUser.message);
      return;
    }

    if (!originUser.canSyncRoles) {
      await interaction.editReply("You do not have the permission to sync roles");
      return;
    }

    const targetMember = interaction.options.getUser("user");

    try {
      if (targetMember) {
        await interaction.editReply(`Syncing roles for ${targetMember.tag}...`);

        const targetUser = await fetchUser(targetMember.id);

        if (targetUser.error) {
          await interaction.editReply("Failed to fetch user: " + targetUser.message);
          return;
        }

        await fetch(`${WEBSITE_URL}/api/admin/sync-roles/${targetUser.user.login}`, {
          method: "POST",
          headers: {
            "x-api-key": API_KEY,
          },
        });
      } else {
        if (!interaction.guildId) {
          await interaction.editReply(
            "This command must be run in a guild for bulk sync, or specify a user."
          );
          return;
        }
        await interaction.editReply("Website sync triggered. Updating Discord roles...");
        await fetch(`${WEBSITE_URL}/api/admin/sync-roles`, {
          method: "POST",
          headers: {
            "x-api-key": API_KEY,
          },
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(
          "Role Synchronization" +
            (targetMember ? ` for ${targetMember.tag}` : "") +
            " scheduled"
        )
        .setColor(0x00ff00)
        .setTimestamp();

      await interaction.editReply({ content: "", embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply(
        "An error occurred during synchronization: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  },
};
