import { answersSelectSchema } from "@/db/schema/answers";
import { fixApiDate } from "@/lib/utils";
import z from "zod";

const schema = {
  "@post/api/admin/answers/:answerId": {
    input: z
      .object({
        name: z.string().nonempty(),
        answer: z.string().nonempty(),
        points: z.number(),
      })
      .partial(),
    output: fixApiDate(answersSelectSchema),
  },
  "@delete/api/admin/answers/:answerId": {
    output: fixApiDate(answersSelectSchema),
  },
};

export default schema;
