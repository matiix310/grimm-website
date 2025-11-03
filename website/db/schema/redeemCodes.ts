import { InferSelectModel, relations } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { cuid2 } from "drizzle-cuid2/postgres";
import { redeemUsers } from "./redeemUsers";

export const redeemCodes = pgTable("redeem_codes", {
  id: cuid2("id").defaultRandom().primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull().default("Code"),
  points: integer("points").notNull(),
  maxUsage: integer("max_usage"),
  ...timestamps,
});

export type RedeemCodes = InferSelectModel<typeof redeemCodes>;

export const redeemCodesInsertSchema = createInsertSchema(redeemCodes);
export const redeemCodesSelectSchema = createSelectSchema(redeemCodes);
export const redeemCodesUpdateSchema = createUpdateSchema(redeemCodes);

export const redeemCodesToUsersRelations = relations(redeemCodes, ({ many }) => ({
  users: many(redeemUsers),
}));
