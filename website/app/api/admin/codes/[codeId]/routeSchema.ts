import { redeemCodesSelectSchema } from "@/db/schema/redeemCodes";
import { fixApiDate } from "@/lib/utils";
import z from "zod";

const schema = {
  "@post/api/admin/codes/:codeId": {
    input: z
      .object({
        maxUsage: z.number().positive(),
        name: z.string().nonempty(),
        points: z.number(),
      })
      .partial(),
    output: fixApiDate(redeemCodesSelectSchema),
  },
  "@delete/api/admin/codes/:codeId": {
    output: fixApiDate(redeemCodesSelectSchema),
  },
};

export default schema;
