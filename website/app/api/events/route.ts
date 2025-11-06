import { db } from "@/db";
import { events, eventsInsertSchema } from "@/db/schema/events";
import ApiResponse from "@/lib/apiResponse";
import { fixApiDate } from "@/lib/utils";
import { hasPermission } from "@/utils/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export const GET = async () => {
  const events = await db.query.events.findMany();

  return ApiResponse.json(events);
};

export const PUT = async (request: NextRequest) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { events: ["create"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ events: ["create"] });

  // get the request body
  const json = await request.json().catch(() => null);

  if (json === null) return ApiResponse.badRequestBodyParsing();

  const parsed = fixApiDate(
    eventsInsertSchema.pick({ name: true, description: true, image: true, date: true }),
    ["date"]
  ).safeParse(json);

  if (parsed.error) return ApiResponse.badRequestBodyValidation(parsed.error.issues);

  // insert the events
  const insertedEvents = await db.insert(events).values(parsed.data).returning();

  if (insertedEvents.length === 0) return ApiResponse.internalServerError();

  return ApiResponse.json(insertedEvents[0]);
};
