import { pointsInsertSchema, pointsSelectSchema } from "@/db/schema/points";
import { fixApiDate } from "@/lib/utils";
import z from "zod";

const schema = {
  "/api/users/:id/points": {
    output: z.object({
      points: z.number(),
    }),
  },
  "@put/api/users/:id/points": {
    input: pointsInsertSchema
      .pick({ amount: true, name: true })
      .and(z.object({ tags: z.optional(z.array(z.string())) })),
    output: fixApiDate(pointsSelectSchema),
  },
  "@delete/api/users/:id/points": {
    input: z.object({
      id: z.string(),
    }),
    output: fixApiDate(pointsSelectSchema),
  },
};

export default schema;
