import { db } from "@/db";
import { user as userSchema } from "@/db/schema/auth";
import {
  points,
  pointsInsertSchema,
  points as pointsSchema,
  pointsToTags,
} from "@/db/schema/points";
import { auth } from "@/lib/auth";
import { and, eq, sum } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const GET = async (
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]/points">
) => {
  const params = await ctx.params;

  const user = await db.query.user.findFirst({
    where: eq(userSchema.login, params.userId),
  });

  if (!user) return NextResponse.json({ error: true, message: "User not found" });

  const points = await db
    .select({
      value: sum(pointsSchema.amount),
    })
    .from(pointsSchema)
    .where(eq(pointsSchema.userId, user.login));

  if (points.length === 0)
    return NextResponse.json({ error: true, message: "Internal error" });

  return NextResponse.json({ error: false, data: parseInt(points[0].value ?? "0") });
};

export const POST = async (
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]/points">
) => {
  // must have the admin role
  if ((await auth.api.getSession({ headers: await headers() }))?.user.role !== "admin")
    return NextResponse.json({
      error: true,
      message: "You don't have the required permissions to use this endpoint",
    });

  const json = await request.json().catch(() => null);

  if (json === null)
    return NextResponse.json({ error: true, message: "Invalid json body" });

  const params = await ctx.params;

  const user = await db.query.user.findFirst({
    where: eq(userSchema.login, params.userId),
  });

  if (!user) return NextResponse.json({ error: true, message: "User not found" });

  // get the list of available tags
  const availableTags = await db.query.pointTags.findMany({
    columns: {
      id: true,
    },
  });

  const parsed = pointsInsertSchema
    .pick({ amount: true, name: true })
    .and(
      z
        .object({
          tags:
            availableTags.length > 0
              ? z
                  .array(z.union(availableTags.map((t) => z.literal(t.id))))
                  .refine((items) => new Set(items).size === items.length, {
                    message: "tags must be a list of unique tags",
                  })
              : z.never(),
        })
        .partial()
    )
    .safeParse(json);

  if (parsed.error)
    return NextResponse.json({
      error: true,
      message: "Invalid body",
      issues: parsed.error.issues,
    });

  const insertedPoints = await db
    .insert(points)
    .values({ userId: user.id, name: parsed.data.name, amount: parsed.data.amount })
    .returning();

  if (insertedPoints.length === 0)
    return NextResponse.json({ error: true, message: "Internal error" });

  if (parsed.data.tags && parsed.data.tags.length > 0) {
    await db
      .insert(pointsToTags)
      .values(parsed.data.tags.map((t) => ({ pointId: insertedPoints[0].id, tagId: t })));
  }

  return NextResponse.json({ error: false, data: parsed.data });
};

export const DELETE = async (
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]/points">
) => {
  // must have the admin role
  if ((await auth.api.getSession({ headers: await headers() }))?.user.role !== "admin")
    return NextResponse.json({
      error: true,
      message: "You don't have the required permissions to use this endpoint",
    });

  const json = await request.json().catch(() => null);

  if (json === null)
    return NextResponse.json({ error: true, message: "Invalid json body" });

  const params = await ctx.params;

  const user = await db.query.user.findFirst({
    where: eq(userSchema.login, params.userId),
  });

  if (!user) return NextResponse.json({ error: true, message: "User not found" });

  const availablePointIds = await db.query.points.findMany({
    where: eq(pointsSchema.userId, user.id),
    columns: {
      id: true,
    },
  });

  const parsed = z
    .object({
      id:
        availablePointIds.length > 0
          ? z.union(availablePointIds.map((p) => z.literal(p.id)))
          : z.never(),
    })
    .safeParse(json);

  if (parsed.error)
    return NextResponse.json({
      error: true,
      message: "Invalid body",
      issues: parsed.error.issues,
    });

  const removedPoints = await db
    .delete(pointsSchema)
    .where(and(eq(pointsSchema.userId, user.id), eq(pointsSchema.id, parsed.data.id)))
    .returning();

  if (removedPoints.length === 0)
    return NextResponse.json({ error: true, message: "Internal error" });

  return NextResponse.json({ error: false, data: parsed.data });
};
