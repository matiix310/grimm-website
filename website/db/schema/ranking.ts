import { InferSelectModel, relations } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { user } from "./auth";

export const ranking = pgTable("ranking", {
  rank: integer("rank").notNull().default(0),
  points: integer("points").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .primaryKey(),
  ...timestamps,
});

export type MinecraftUsernames = InferSelectModel<typeof ranking>;

export const rankingRelations = relations(ranking, ({ one }) => ({
  user: one(user, {
    fields: [ranking.userId],
    references: [user.id],
  }),
}));
