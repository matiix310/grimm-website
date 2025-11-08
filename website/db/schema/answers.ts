import { InferSelectModel, relations } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { cuid2 } from "drizzle-cuid2/postgres";
import { answerUsers } from "./answerUsers";

export const answers = pgTable("answers", {
  id: cuid2("id").defaultRandom().primaryKey(),
  answer: text("answer").notNull(),
  name: text("name").notNull(),
  points: integer("points").notNull(),
  ...timestamps,
});

export type Answers = InferSelectModel<typeof answers>;

export const answersInsertSchema = createInsertSchema(answers);
export const answersSelectSchema = createSelectSchema(answers);
export const answersUpdateSchema = createUpdateSchema(answers);

export const answersToUsersRelations = relations(answers, ({ many }) => ({
  users: many(answerUsers),
}));
