import { InferSelectModel, relations } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { user } from "./auth";

export const totalPoints = pgTable("total_points", {
  points: integer("points").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .primaryKey(),
  ...timestamps,
});

export type MinecraftUsernames = InferSelectModel<typeof totalPoints>;

export const totalPointsRelations = relations(totalPoints, ({ one }) => ({
  tags: one(user, {
    fields: [totalPoints.userId],
    references: [user.id],
  }),
}));
