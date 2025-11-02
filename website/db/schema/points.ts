import { cuid2 } from "drizzle-cuid2/postgres";
import { InferSelectModel, relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { pointTags } from "./pointTags";
import { user } from "./auth";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const points = pgTable("points", {
  id: cuid2("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  amount: integer("amount").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...timestamps,
});

export type Points = InferSelectModel<typeof points>;

export const pointsInsertSchema = createInsertSchema(points);
export const pointsSelectSchema = createSelectSchema(points);
export const pointsUpdateSchema = createUpdateSchema(points);

export const pointsRelations = relations(points, ({ many }) => ({
  tags: many(pointsToTags),
}));

// Because its a many-to-many relation, we need an intermediate table to link the points to the tags
export const pointsToTags = pgTable(
  "points_to_tags",
  {
    pointId: varchar("point_id", { length: 24 })
      .notNull()
      .references(() => points.id, { onDelete: "cascade" }),
    tagId: varchar("tag_id", { length: 24 })
      .notNull()
      .references(() => pointTags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.pointId, t.tagId] })]
);

export const pointsToTagsRelations = relations(pointsToTags, ({ one }) => ({
  point: one(points, {
    fields: [pointsToTags.pointId],
    references: [points.id],
  }),
  tag: one(pointTags, {
    fields: [pointsToTags.tagId],
    references: [pointTags.id],
  }),
}));
