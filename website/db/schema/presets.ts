import { cuid2 } from "drizzle-cuid2/postgres";
import { InferSelectModel } from "drizzle-orm";
import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helper";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const presets = pgTable("presets", {
  id: cuid2("id").defaultRandom().primaryKey(),
  presetName: text("preset_name").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  points: integer("points").notNull(),
  ...timestamps,
});

export type Presets = InferSelectModel<typeof presets>;

export const presetsInsertSchema = createInsertSchema(presets);
export const presetsSelectSchema = createSelectSchema(presets);
export const presetsUpdateSchema = createUpdateSchema(presets);
