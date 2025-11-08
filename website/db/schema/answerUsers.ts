import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { answers } from "./answers";
import { user } from "./auth";

export const answerUsers = pgTable("answer_users", {
  answerId: text("answer_id")
    .notNull()
    .references(() => answers.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...timestamps,
});

export type AnswerUsers = InferSelectModel<typeof answerUsers>;

export const answerUsersInsertSchema = createInsertSchema(answerUsers);
export const answerUsersSelectSchema = createSelectSchema(answerUsers);
export const answerUsersUpdateSchema = createUpdateSchema(answerUsers);

export const answerUsersToAnswerRelations = relations(answerUsers, ({ one }) => ({
  answer: one(answers, {
    fields: [answerUsers.answerId],
    references: [answers.id],
  }),
}));
