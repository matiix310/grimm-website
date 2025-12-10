import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const discordRoleMappings = pgTable("discord_role_mappings", {
  id: uuid("id").primaryKey().defaultRandom(),
  guildId: text("guild_id").notNull(),
  discordRoleId: text("discord_role_id").notNull(),
  websiteRoleId: text("website_role_id").notNull(),
});
