import { newsInsertSchema, newsSelectSchema } from "@/db/schema/news";
import newsSchema from "./[newsId]/routeSchema";
import { fixApiDate } from "@/lib/utils";
import z from "zod";

const schema = {
  "/api/news": {
    output: z.array(fixApiDate(newsSelectSchema)),
  },
  "@put/api/news": {
    input: newsInsertSchema.pick({ name: true, description: true, image: true }),
    output: fixApiDate(newsSelectSchema),
  },
  ...newsSchema,
};

export default schema;
