import { InferSelectModel, relations } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { user } from "./auth";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const ranking = pgTable("ranking", {
  rank: integer("rank").notNull().default(0),
  points: integer("points").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .primaryKey(),
  ...timestamps,
});

export type Ranking = InferSelectModel<typeof ranking>;

export const rankingInsertSchema = createInsertSchema(ranking);
export const rankingSelectSchema = createSelectSchema(ranking);
export const rankingUpdateSchema = createUpdateSchema(ranking);

export const rankingRelations = relations(ranking, ({ one }) => ({
  user: one(user, {
    fields: [ranking.userId],
    references: [user.id],
  }),
}));
