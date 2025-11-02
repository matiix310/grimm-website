import { db } from "@/db";
import { user, user as userSchema } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { rolesMetadata } from "@/lib/permissions";
import { hasPermission } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { headers as nextHeaders } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const GET = async (
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]">
) => {
  const params = await ctx.params;

  const userResponse = await db.query.user.findFirst({
    where: eq(userSchema.login, params.userId),
  });

  if (!userResponse)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  const user = await auth.api.getSession({ headers: await nextHeaders() });

  // By default, users can manage users with a role that has a lower priority
  // If a user is not logged in it gets a priority of -1 (aka can't do anything)
  const userPriority = !user?.user.role
    ? -1
    : rolesMetadata[user?.user.role as keyof typeof rolesMetadata].priority;

  const targetPriority = !userResponse.role
    ? -1
    : rolesMetadata[userResponse.role as keyof typeof rolesMetadata].priority;

  const canGiveRoles =
    userPriority <= targetPriority
      ? userResponse.role === null
        ? []
        : [userResponse.role]
      : Object.entries(rolesMetadata)
          .filter(([, { priority }]) => priority < userPriority)
          .map(([roleName]) => roleName);

  return NextResponse.json({
    user: {
      id: userResponse.id,
      name: userResponse.name,
      image: userResponse.image,
      role: userResponse.role,
      banned: userResponse.banned,
      login: userResponse.login,
      updatedAt: userResponse.updatedAt,
      createdAt: userResponse.createdAt,
    },
    canGiveRoles,
  });
};

export const POST = async (
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]">
) => {
  const params = await ctx.params;

  const headers = await nextHeaders();
  if (
    !(await hasPermission({
      headers,
      permissions: { grimmUser: ["update"] },
    }))
  )
    return NextResponse.json(
      {
        message: "You don't have the required permissions to use this endpoint",
      },
      { status: 401 }
    );

  const targetUser = await db.query.user.findFirst({
    where: eq(userSchema.login, params.userId),
  });

  if (!targetUser)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  const json = await request.json().catch(() => null);

  if (json === null)
    return NextResponse.json({ message: "Body is not parsable" }, { status: 400 });

  const parsed = z
    .object({
      name: z
        .string()
        .nonempty()
        .refine((arg) => arg.replaceAll(" ", "").length > 0, {
          error: "Should not be empty",
        }),
      role: z.union(
        Object.keys(rolesMetadata).map((r) => z.literal(r as keyof typeof rolesMetadata))
      ),
    })
    .partial()
    .safeParse(json);

  if (parsed.error)
    return NextResponse.json(
      { message: "Malformed body", issues: parsed.error.issues },
      { status: 400 }
    );

  if (Object.keys(parsed.data).length === 0)
    return NextResponse.json({ message: "Body should not be empty" }, { status: 400 });

  if (parsed.data.role !== undefined) {
    const originUser = await auth.api.getSession({ headers });

    if (!originUser)
      return NextResponse.json(
        { message: "Only a user can change the role of another user" },
        { status: 401 }
      );

    // check that the user as the permission to assign this role
    const targetUserPriority = !targetUser.role
      ? -1
      : rolesMetadata[targetUser.role as keyof typeof rolesMetadata].priority;

    const originUserPriority = !originUser.user.role
      ? -1
      : rolesMetadata[originUser.user.role as keyof typeof rolesMetadata].priority;

    if (originUserPriority <= targetUserPriority)
      return NextResponse.json(
        {
          message:
            "You don't have the required permissions to edit the role of this user",
        },
        { status: 401 }
      );

    const rolePriority = rolesMetadata[parsed.data.role].priority;

    if (originUserPriority <= rolePriority)
      return NextResponse.json(
        {
          message: "You don't have the required permissions to assign this role",
        },
        { status: 401 }
      );
  }

  const updatedUser = await db
    .update(user)
    .set(parsed.data)
    .where(eq(user.id, targetUser.id))
    .returning();

  if (updatedUser.length === 0)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });

  return NextResponse.json({
    user: {
      id: updatedUser[0].id,
      name: updatedUser[0].name,
      image: updatedUser[0].image,
      role: updatedUser[0].role,
      banned: updatedUser[0].banned,
      login: updatedUser[0].login,
      updatedAt: updatedUser[0].updatedAt,
      createdAt: updatedUser[0].createdAt,
    },
  });
};
