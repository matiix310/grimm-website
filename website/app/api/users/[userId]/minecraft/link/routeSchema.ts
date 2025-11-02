import { minecraftUsernamesSelectSchema } from "@/db/schema/minecraftUsernames";
import { fixApiDate } from "@/lib/utils";
import z from "zod";

const schema = {
  "/api/users/:id/minecraft/link": {
    output: fixApiDate(minecraftUsernamesSelectSchema),
  },
  "@post/api/users/:id/minecraft/link": {
    input: z.object({
      username: z.string(),
    }),
    output: fixApiDate(minecraftUsernamesSelectSchema),
  },
};

export default schema;
