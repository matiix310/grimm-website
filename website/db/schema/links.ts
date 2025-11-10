import { InferSelectModel } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const links = pgTable("links", {
  name: varchar("name", { length: 100 }).primaryKey(),
  link: text("link").notNull(),
  ...timestamps,
});

export type Links = InferSelectModel<typeof links>;

export const linksInsertSchema = createInsertSchema(links);
export const linksSelectSchema = createSelectSchema(links);
export const linksUpdateSchema = createUpdateSchema(links);
