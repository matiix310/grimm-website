import { db } from "@/db";
import { user, user as userSchema } from "@/db/schema/auth";
import ApiResponse from "@/lib/apiResponse";
import { auth } from "@/lib/auth";
import { rolesMetadata } from "@/lib/permissions";
import { hasPermission } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { headers as nextHeaders } from "next/headers";
import { NextRequest } from "next/server";
import z from "zod";

export const GET = async (
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]">
) => {
  const params = await ctx.params;

  const userResponse = await db.query.user.findFirst({
    where: eq(userSchema.login, params.userId),
  });

  if (!userResponse) return ApiResponse.notFoundUser();

  const user = await auth.api.getSession({ headers: await nextHeaders() });

  // By default, users can manage users with a role that has a lower priority
  // If a user is not logged in it gets a priority of -Infinity (aka can't do anything)

  const userRoles = user?.user.role?.split(",").filter((r) => r in rolesMetadata) ?? [];
  const userPriority = Math.max(
    ...userRoles.map((r) => rolesMetadata[r as keyof typeof rolesMetadata].priority)
  );

  const targetRoles =
    userResponse.role?.split(",").filter((r) => r in rolesMetadata) ?? [];
  const targetPriority = Math.max(
    ...targetRoles.map((r) => rolesMetadata[r as keyof typeof rolesMetadata].priority)
  );

  const canEditRoles =
    userPriority <= targetPriority && userPriority < rolesMetadata.admin.priority
      ? []
      : Object.entries(rolesMetadata)
          .filter(([r, { priority }]) => priority < userPriority && r !== "user")
          .map(([roleName]) => roleName);

  return ApiResponse.json({
    user: {
      id: userResponse.id,
      name: userResponse.name,
      image: userResponse.image,
      roles: targetRoles,
      banned: userResponse.banned,
      login: userResponse.login,
      updatedAt: userResponse.updatedAt,
      createdAt: userResponse.createdAt,
    },
    canEditRoles,
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
    return ApiResponse.unauthorizedPermission({ grimmUser: ["update"] });

  const targetUser = await db.query.user.findFirst({
    where: eq(userSchema.login, params.userId),
  });

  if (!targetUser) return ApiResponse.notFoundUser();

  const json = await request.json().catch(() => null);

  if (json === null) return ApiResponse.badRequestBodyParsing();

  const parsed = z
    .object({
      name: z
        .string()
        .nonempty()
        .refine((arg) => arg.replaceAll(" ", "").length > 0, {
          error: "Should not be empty",
        }),
      roles: z.array(
        z.union(
          Object.keys(rolesMetadata).map((r) =>
            z.literal(r as keyof typeof rolesMetadata)
          )
        )
      ),
    })
    .partial()
    .safeParse(json);

  if (parsed.error) return ApiResponse.badRequestBodyValidation(parsed.error.issues);

  if (Object.keys(parsed.data).length === 0)
    return ApiResponse.badRequest("Body should not be empty");

  if (parsed.data.roles !== undefined) {
    const originUser = await auth.api.getSession({ headers });

    if (!originUser)
      return ApiResponse.unauthorized("Only a user can change the role of another user");

    const originUserRoles = (originUser.user.role
      ?.split(",")
      .filter((r) => r in rolesMetadata) ?? []) as (keyof typeof rolesMetadata)[];
    const targetUserRoles = (targetUser.role
      ?.split(",")
      .filter((r) => r in rolesMetadata) ?? []) as (keyof typeof rolesMetadata)[];

    // check that the target user has a lower priority than the origin user
    const originUserMaxPriority = Math.max(
      ...originUserRoles.map(
        (r) => rolesMetadata[r as keyof typeof rolesMetadata].priority
      )
    );

    const targetUserMaxPriority = Math.max(
      ...targetUserRoles.map(
        (r) => rolesMetadata[r as keyof typeof rolesMetadata].priority
      )
    );

    if (
      targetUserMaxPriority >= originUserMaxPriority &&
      originUserMaxPriority < rolesMetadata.admin.priority
    )
      return ApiResponse.unauthorized(
        "The target user has a greater priority than yours. You can't edit their roles"
      );

    // check that the origin user can give / remove the roles he has given / removed
    const newRoles = parsed.data.roles.filter((r) => !targetUserRoles.includes(r));
    const removedRoles = targetUserRoles.filter((r) => !parsed.data.roles!.includes(r));

    const editedRoles = [...newRoles, ...removedRoles];

    if (removedRoles.includes("user"))
      return ApiResponse.unauthorized(`You can't remove the defautl role: ${user}`);

    for (const role of editedRoles) {
      const priority = rolesMetadata[role].priority;
      if (priority >= originUserMaxPriority)
        return ApiResponse.unauthorized(
          `You can't edit the role ${role}. You don't have the required permissions.`
        );
    }

    // order the role with their priority
    parsed.data.roles.toSorted(
      (a, b) => rolesMetadata[b].priority - rolesMetadata[a].priority
    );
  }

  const updatedUser = await db
    .update(user)
    .set({ ...parsed.data, role: parsed.data.roles?.join(",") })
    .where(eq(user.id, targetUser.id))
    .returning();

  if (updatedUser.length === 0) return ApiResponse.internalServerError();

  return ApiResponse.json({
    id: updatedUser[0].id,
    name: updatedUser[0].name,
    image: updatedUser[0].image,
    roles: updatedUser[0].role?.split(",").filter((r) => r in rolesMetadata) ?? [],
    banned: updatedUser[0].banned,
    login: updatedUser[0].login,
    updatedAt: updatedUser[0].updatedAt,
    createdAt: updatedUser[0].createdAt,
  });
};
