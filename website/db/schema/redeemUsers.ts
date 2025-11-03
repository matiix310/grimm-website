import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { redeemCodes } from "./redeemCodes";
import { user } from "./auth";

export const redeemUsers = pgTable("redeem_users", {
  codeId: text("code_id").references(() => redeemCodes.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...timestamps,
});

export type RedeemUsers = InferSelectModel<typeof redeemUsers>;

export const redeemUsersInsertSchema = createInsertSchema(redeemUsers);
export const redeemUsersSelectSchema = createSelectSchema(redeemUsers);
export const redeemUsersUpdateSchema = createUpdateSchema(redeemUsers);

export const redeemUsersToCodeRelations = relations(redeemUsers, ({ one }) => ({
  code: one(redeemCodes, {
    fields: [redeemUsers.codeId],
    references: [redeemCodes.id],
  }),
}));
