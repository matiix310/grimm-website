import { redeemCodesSelectSchema } from "@/db/schema/redeemCodes";
import { fixApiDate } from "@/lib/utils";
import z from "zod";

import codesSchema from "./[codeId]/routeSchema";

const schema = {
  "/api/admin/codes": {
    output: z.array(
      fixApiDate(redeemCodesSelectSchema).and(
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
  "@put/api/admin/codes": {
    input: z.object({
      maxUsage: z.number().positive().optional(),
      name: z.string().nonempty(),
      points: z.number(),
    }),
    output: fixApiDate(redeemCodesSelectSchema),
  },
  ...codesSchema,
};

export default schema;
