import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { user } from "./auth";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { minecraftAuthorizations } from "./minecraftAuthorizations";

export const minecraftUsernames = pgTable("minecraft_usernames", {
  username: text("username").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .primaryKey(),
  ...timestamps,
});

export type MinecraftUsernames = InferSelectModel<typeof minecraftUsernames>;

export const minecraftUsernamesInsertSchema = createInsertSchema(minecraftUsernames);
export const minecraftUsernamesSelectSchema = createSelectSchema(minecraftUsernames);
export const minecraftUsernamesUpdateSchema = createUpdateSchema(minecraftUsernames);

export const minecraftUsernamesRelations = relations(
  minecraftUsernames,
  ({ one, many }) => ({
    tags: one(user, {
      fields: [minecraftUsernames.userId],
      references: [user.id],
    }),
    authorizations: many(minecraftAuthorizations),
  })
);
