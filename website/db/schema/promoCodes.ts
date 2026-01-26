import { InferSelectModel } from "drizzle-orm";
import { boolean, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const promoCodes = pgTable("promo_codes", {
  code: varchar("code", { length: 10 }).notNull().primaryKey(),
  kind: text("kind").notNull(),
  used: boolean("used").notNull().default(false),
  orderId: text("order_id"),
  ...timestamps,
});

export type PromoCodes = InferSelectModel<typeof promoCodes>;

export const promoCodesInsertSchema = createInsertSchema(promoCodes);
export const promoCodesSelectSchema = createSelectSchema(promoCodes);
export const promoCodesUpdateSchema = createUpdateSchema(promoCodes);
