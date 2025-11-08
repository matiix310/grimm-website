import answersSchema from "./[answerId]/routeSchema";
import { fixApiDate } from "@/lib/utils";
import z from "zod";

import { answersSelectSchema } from "@/db/schema/answers";

const schema = {
  "/api/admin/answers": {
    output: z.array(
      fixApiDate(answersSelectSchema).and(
        z.object({
          users: z.array(
            z.object({
              userId: z.string(),
              createdAt: z.coerce.date(),
            })
          ),
        })
      )
    ),
  },
  "@put/api/admin/answers": {
    input: z.object({
      name: z.string().nonempty(),
      answer: z.string().nonempty(),
      points: z.number(),
    }),
    output: fixApiDate(answersSelectSchema),
  },
  ...answersSchema,
};

export default schema;
