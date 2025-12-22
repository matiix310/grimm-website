import { pgTable, text } from "drizzle-orm/pg-core";

export const discordLogChannel = pgTable("discord_log_channel", {
  guildId: text("guild_id").primaryKey(),
  channelId: text("channel_id").notNull(),
});
