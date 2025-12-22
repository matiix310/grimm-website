import { Events, GuildMember } from "discord.js";
import { fetchUser } from "../services/sync";

export default {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: GuildMember) {
    if (member.user.bot) return;

    try {
      const { API_KEY, WEBSITE_URL } = process.env;

      if (!API_KEY || !WEBSITE_URL) {
        console.error("Missing API_KEY or WEBSITE_URL");
        return;
      }

      console.log(`User ${member.user.tag} joined. Checking for linked account...`);

      const userResult = await fetchUser(member.id);

      if (userResult.error) {
        console.log(
          `User ${member.user.tag} is not linked or error: ${userResult.message}`
        );
        return;
      }

      console.log(
        `User ${member.user.tag} is linked as ${userResult.user.login}. Triggering sync...`
      );

      const syncResponse = await fetch(
        `${WEBSITE_URL}/api/admin/sync-roles/${userResult.user.login}`,
        {
          method: "POST",
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      if (syncResponse.ok) {
        console.log(
          `Successfully triggered sync for ${member.user.tag} (${userResult.user.login})`
        );
      } else {
        console.error(
          `Failed to trigger sync for ${member.user.tag} (${userResult.user.login}): ${syncResponse.statusText}`
        );
      }
    } catch (error) {
      console.error(`Error handling guildMemberAdd for ${member.user.tag}:`, error);
    }
  },
};
