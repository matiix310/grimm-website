import { db } from "@/db";
import { events, eventsUpdateSchema } from "@/db/schema/events";
import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import z from "zod";

export const DELETE = async (
  request: NextRequest,
  ctx: RouteContext<"/api/events/[eventId]">
) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { events: ["delete"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ events: ["delete"] });

  const params = await ctx.params;
  const eventId = params.eventId;

  // check if the events exists
  const eventExists = !!(await db.query.events.findFirst({
    where: eq(events.id, eventId),
    columns: { id: true },
  }));

  if (!eventExists) return ApiResponse.notFound("Event not found");

  // delete the event
  const deletedEvents = await db.delete(events).where(eq(events.id, eventId)).returning();

  if (deletedEvents.length === 0) return ApiResponse.internalServerError();

  return ApiResponse.json(deletedEvents[0]);
};

export const POST = async (
  request: NextRequest,
  ctx: RouteContext<"/api/events/[eventId]">
) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { events: ["update"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ events: ["update"] });

  const params = await ctx.params;
  const eventId = params.eventId;

  // check if the event exists
  const eventExists = !!(await db.query.events.findFirst({
    where: eq(events.id, eventId),
    columns: { id: true },
  }));

  if (!eventExists) return ApiResponse.notFound("Event not found");

  // get the request body
  const json = await request.json().catch(() => null);

  if (json === null) return ApiResponse.badRequestBodyParsing();

  const parsed = eventsUpdateSchema
    .pick({ name: true, description: true, image: true, date: true })
    .refine((obj) => obj.name || obj.description || obj.image, {
      error: "Must have at least one of name, description, image or date field",
    })
    .omit({ date: true })
    .and(z.object({ date: z.coerce.date().optional() }))
    .safeParse(json);

  if (parsed.error) return ApiResponse.badRequestBodyValidation(parsed.error.issues);

  // update the events
  const updatedEvents = await db
    .update(events)
    .set(parsed.data)
    .where(eq(events.id, eventId))
    .returning();

  if (updatedEvents.length === 0) return ApiResponse.internalServerError();

  return ApiResponse.json(updatedEvents[0]);
};
