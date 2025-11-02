import { newsSelectSchema, newsUpdateSchema } from "@/db/schema/news";
import { fixApiDate } from "@/lib/utils";

const schema = {
  "@delete/api/news/:newsId": {
    output: fixApiDate(newsSelectSchema),
  },
  "@post/api/news/:newsId": {
    input: newsUpdateSchema.pick({ name: true, description: true, image: true }),
    output: fixApiDate(newsSelectSchema),
  },
};

export default schema;
