import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { fetchUser } from "../services/sync";

const sendEmbed = (
  interaction: ChatInputCommandInteraction,
  title: string,
  status: "success" | "error" | "warning" = "success",
) => {
  let color = 0x00ff00;
  if (status === "error") color = 0xff0000;
  if (status === "warning") color = 0xffff00;

  const embed = new EmbedBuilder().setTitle(title).setColor(color).setTimestamp();

  return interaction.editReply({ content: "", embeds: [embed] });
};

export default {
  data: new SlashCommandBuilder()
    .setName("sync")
    .setDescription("Synchronize roles")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to synchronize").setRequired(false),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { API_KEY, WEBSITE_URL } = process.env;

    if (!API_KEY || !WEBSITE_URL) {
      await sendEmbed(interaction, "Missing API_KEY or WEBSITE_URL", "error");
      return;
    }

    // check that the user has the permission to sync roles
    const originUser = await fetchUser(interaction.user.id);

    if (originUser.error) {
      await sendEmbed(interaction, originUser.message, "error");
      return;
    }

    if (!originUser.canSyncRoles) {
      await sendEmbed(
        interaction,
        "You do not have the permission to sync roles",
        "error",
      );
      return;
    }

    const targetMember = interaction.options.getUser("user");

    try {
      if (targetMember) {
        await sendEmbed(interaction, `Fetching user ${targetMember.tag}...`);

        const targetUser = await fetchUser(targetMember.id);

        if (targetUser.error) {
          await sendEmbed(
            interaction,
            "Failed to fetch user: " + targetUser.message,
            "error",
          );
          return;
        }

        await sendEmbed(
          interaction,
          `Creating the sync job for ${targetUser.user.login} (${targetMember.tag})...`,
        );
        await fetch(`${WEBSITE_URL}/api/admin/sync-roles/${targetUser.user.login}`, {
          method: "POST",
          headers: {
            "x-api-key": API_KEY,
          },
        });
      } else {
        if (!interaction.guildId) {
          await sendEmbed(
            interaction,
            "This command must be run in a guild for bulk sync, or specify a user.",
            "error",
          );
          return;
        }
        await sendEmbed(interaction, "Website sync triggered. Updating Discord roles...");
        await fetch(`${WEBSITE_URL}/api/admin/sync-roles`, {
          method: "POST",
          headers: {
            "x-api-key": API_KEY,
          },
        });
      }

      await sendEmbed(
        interaction,
        "Role Synchronization" +
          (targetMember ? ` for ${targetMember.tag}` : "") +
          " scheduled",
      );
    } catch (error) {
      await sendEmbed(
        interaction,
        "An error occurred during synchronization: " +
          (error instanceof Error ? error.message : "Unknown error"),
        "error",
      );
    }
  },
};
