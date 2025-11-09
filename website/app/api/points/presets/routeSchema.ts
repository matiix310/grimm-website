import { presetsSelectSchema } from "@/db/schema/presets";
import { fixApiDate } from "@/lib/utils";
import z from "zod";

const schema = {
  "/api/points/presets": {
    output: z.array(fixApiDate(presetsSelectSchema)),
  },
};

export default schema;
