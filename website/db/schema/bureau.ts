import { InferSelectModel } from "drizzle-orm";
import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const bureau = pgTable("bureau", {
  login: varchar("login", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  image: text("image").notNull(),
  color: varchar("color").notNull(),
  index: integer("index").notNull().default(0),
  ...timestamps,
});

export type Bureau = InferSelectModel<typeof bureau>;

export const bureauInsertSchema = createInsertSchema(bureau);
export const bureauSelectSchema = createSelectSchema(bureau);
export const bureauUpdateSchema = createUpdateSchema(bureau);
