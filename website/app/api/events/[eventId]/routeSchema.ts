import { eventsSelectSchema, eventsUpdateSchema } from "@/db/schema/events";
import { fixApiDate } from "@/lib/utils";
import z from "zod";

const schema = {
  "@delete/api/events/:eventId": {
    output: fixApiDate(eventsSelectSchema, ["createdAt", "updatedAt", "date"]),
  },
  "@post/api/events/:eventId": {
    input: eventsUpdateSchema
      .pick({
        name: true,
        description: true,
        image: true,
        date: true,
      })
      .omit({ date: true })
      .and(z.object({ date: z.coerce.date().optional() })),
    output: fixApiDate(eventsSelectSchema, ["createdAt", "updatedAt", "date"]),
  },
};

export default schema;
