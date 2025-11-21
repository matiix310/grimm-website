import { db } from "@/db";
import { user as userSchema } from "@/db/schema/auth";
import {
  points,
  pointsInsertSchema,
  points as pointsSchema,
  pointsToTags,
} from "@/db/schema/points";
import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { and, eq, sum } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import z from "zod";

export const GET = async (
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]/points">
) => {
  const params = await ctx.params;

  const user = await db.query.user.findFirst({
    where: eq(userSchema.login, params.userId),
  });

  if (!user) return ApiResponse.notFoundUser();

  const points = await db
    .select({
      value: sum(pointsSchema.amount),
    })
    .from(pointsSchema)
    .where(eq(pointsSchema.userId, user.login));

  if (points.length === 0) return ApiResponse.internalServerError();

  return ApiResponse.json({ points: parseInt(points[0].value ?? "0") });
};

export const PUT = async (
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]/points">
) => {
  if (process.env.DISABLE_EDIT_POINTS_ADMIN)
    return ApiResponse.unauthorized(
      "Point system is currently disabled for editing (even for admins)"
    );

  if (
    !(await hasPermission({ headers: await headers(), permissions: { points: ["add"] } }))
  )
    return ApiResponse.unauthorizedPermission({ points: ["add"] });

  const json = await request.json().catch(() => null);

  if (json === null) return ApiResponse.badRequestBodyParsing();

  const params = await ctx.params;

  const user = await db.query.user.findFirst({
    where: eq(userSchema.login, params.userId),
  });

  if (!user) return ApiResponse.notFoundUser();

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
              : z.array(z.never()),
        })
        .partial()
    )
    .safeParse(json);

  if (parsed.error) return ApiResponse.badRequestBodyValidation(parsed.error.issues);

  const insertedPoints = await db
    .insert(points)
    .values({ userId: user.id, name: parsed.data.name, amount: parsed.data.amount })
    .returning();

  if (insertedPoints.length === 0) return ApiResponse.internalServerError();

  if (parsed.data.tags && parsed.data.tags.length > 0) {
    await db
      .insert(pointsToTags)
      .values(parsed.data.tags.map((t) => ({ pointId: insertedPoints[0].id, tagId: t })));
  }

  return ApiResponse.json(insertedPoints[0]);
};

export const DELETE = async (
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]/points">
) => {
  if (process.env.DISABLE_EDIT_POINTS_ADMIN)
    return ApiResponse.unauthorized(
      "Point system is currently disabled for editing (even for admins)"
    );

  if (
    !(await hasPermission({ headers: await headers(), permissions: { points: ["add"] } }))
  )
    return ApiResponse.unauthorizedPermission({ points: ["add"] });

  const json = await request.json().catch(() => null);

  if (json === null) return ApiResponse.badRequestBodyParsing();

  const params = await ctx.params;

  const user = await db.query.user.findFirst({
    where: eq(userSchema.login, params.userId),
  });

  if (!user) return ApiResponse.notFoundUser();

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

  if (parsed.error) return ApiResponse.badRequestBodyValidation(parsed.error.issues);

  const deletedPoints = await db
    .delete(pointsSchema)
    .where(and(eq(pointsSchema.userId, user.id), eq(pointsSchema.id, parsed.data.id)))
    .returning();

  if (deletedPoints.length === 0) return ApiResponse.internalServerError();

  return ApiResponse.json(deletedPoints[0]);
};
