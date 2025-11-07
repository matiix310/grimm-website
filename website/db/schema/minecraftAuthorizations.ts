import { InferSelectModel, relations } from "drizzle-orm";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { minecraftUsernames } from "./minecraftUsernames";

export const minecraftAuthorizations = pgTable("minecraft_authorizations", {
  username: text("username")
    .notNull()
    .references(() => minecraftUsernames.username, { onDelete: "no action" }),
  used: boolean("used").default(false).notNull(),
  ...timestamps,
});

export type RedeemUsers = InferSelectModel<typeof minecraftAuthorizations>;

export const minecraftAuthorizationsInsertSchema = createInsertSchema(
  minecraftAuthorizations
);
export const minecraftAuthorizationsSelectSchema = createSelectSchema(
  minecraftAuthorizations
);
export const minecraftAuthorizationsUpdateSchema = createUpdateSchema(
  minecraftAuthorizations
);

export const minecraftAuthorizationsRelations = relations(
  minecraftAuthorizations,
  ({ one }) => ({
    code: one(minecraftUsernames, {
      fields: [minecraftAuthorizations.username],
      references: [minecraftUsernames.username],
    }),
  })
);
