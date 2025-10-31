import { cuid2 } from "drizzle-cuid2/postgres";
import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { pointsToTags } from "./points";
import { createSelectSchema } from "drizzle-zod";

export const pointTags = pgTable("point_tags", {
  id: cuid2("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 32 }).notNull(),
  textColor: varchar("text_color", { length: 32 }).notNull(),
  ...timestamps,
});

export type PointTags = InferSelectModel<typeof pointTags>;
export const pointTagsSelectSchema = createSelectSchema(pointTags);

export const pointTagsRelations = relations(pointTags, ({ many }) => ({
  points: many(pointsToTags),
}));
