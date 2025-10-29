import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { user } from "./auth";

export const minecraftUsernames = pgTable("minecraft_usernames", {
  username: text("username").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...timestamps,
});

export type MinecraftUsernames = InferSelectModel<typeof minecraftUsernames>;

export const minecraftUsernamesRelations = relations(minecraftUsernames, ({ one }) => ({
  tags: one(user, {
    fields: [minecraftUsernames.userId],
    references: [user.id],
  }),
}));
