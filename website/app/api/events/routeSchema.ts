import { eventsInsertSchema, eventsSelectSchema } from "@/db/schema/events";
import eventsSchema from "./[eventId]/routeSchema";
import { fixApiDate } from "@/lib/utils";
import z from "zod";

const schema = {
  "/api/events": {
    output: z.array(fixApiDate(eventsSelectSchema, ["createdAt", "updatedAt", "date"])),
  },
  "@put/api/events": {
    input: fixApiDate(
      eventsInsertSchema.pick({
        name: true,
        description: true,
        image: true,
        date: true,
      }),
      ["date"]
    ),
    output: fixApiDate(eventsSelectSchema, ["createdAt", "updatedAt", "date"]),
  },
  ...eventsSchema,
};

export default schema;
