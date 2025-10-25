import { cuid2 } from "drizzle-cuid2/postgres";
import { InferSelectModel } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";

export const news = pgTable("news", {
  id: cuid2("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  ...timestamps,
});

export type News = InferSelectModel<typeof news>;
