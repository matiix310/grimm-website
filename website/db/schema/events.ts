import { cuid2 } from "drizzle-cuid2/postgres";
import { InferSelectModel } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const events = pgTable("events", {
  id: cuid2("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  date: timestamp("date").notNull(),
  ...timestamps,
});

export type Events = InferSelectModel<typeof events>;

export const eventsInsertSchema = createInsertSchema(events);
export const eventsSelectSchema = createSelectSchema(events);
export const eventsUpdateSchema = createUpdateSchema(events);
