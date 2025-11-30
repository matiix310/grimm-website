import { InferSelectModel } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const adventCalendar = pgTable("advent_calendar", {
  day: integer("day").primaryKey().notNull(),
  date: timestamp("date", { mode: "date" }),
  content: text("content"),
  ...timestamps,
});

export type AdventCalendar = InferSelectModel<typeof adventCalendar>;

export const adventCalendarInsertSchema = createInsertSchema(adventCalendar);
export const adventCalendarSelectSchema = createSelectSchema(adventCalendar);
export const adventCalendarUpdateSchema = createUpdateSchema(adventCalendar);
