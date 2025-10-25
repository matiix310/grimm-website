import { cuid2 } from "drizzle-cuid2/postgres";
import { InferSelectModel } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";

export const events = pgTable("events", {
  id: cuid2("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  ...timestamps,
});

export type Events = InferSelectModel<typeof events>;
