import { db } from "@/db";
import { account, user, user as userSchema } from "@/db/schema/auth";
import { minecraftUsernames } from "@/db/schema/minecraftUsernames";
import ApiResponse from "@/lib/apiResponse";
import { auth } from "@/lib/auth";
import { listAuthentikGroups } from "@/lib/authentik";
import { rolesMetadata } from "@/lib/permissions";
import { performUserRoleSync } from "@/lib/sync-roles";
import { hasPermission } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { headers as nextHeaders } from "next/headers";
import { NextRequest } from "next/server";
import z from "zod";

function priorityOf(roles: string[]): number {
  const known = roles.filter((r): r is keyof typeof rolesMetadata => r in rolesMetadata);
  if (known.length === 0) return 0;
  return Math.max(...known.map((r) => rolesMetadata[r].priority));
}

async function getValidAuthentikGroupNames(): Promise<Set<string>> {
  const groups = await listAuthentikGroups();
  return new Set(groups.map((g) => g.name));
}

export const getUser = async (login: string) => {
  const target = await db.query.user.findFirst({
    where: eq(userSchema.login, login),
  });

  if (!target) return ApiResponse.notFoundUser();

  const headers = await nextHeaders();

  const user = await auth.api.getSession({ headers });

  const userRoles = user?.user.role?.split(",").filter((r) => r in rolesMetadata) ?? [];
  const userPriority = priorityOf(userRoles);

  // A website-admin may grant any catalog role regardless of the priority
  // ladder. We check this by literal name (not by priority value) so a future
  // "owner" role above 99 does not silently inherit admin powers.
  const isWebsiteAdmin = userRoles.includes("website-admin");

  const targetPriority = priorityOf(
    target.role?.split(",").filter((r) => r in rolesMetadata) ?? [],
  );

  // Roles an admin is allowed to assign: derived from the live Authentik
  // catalog, gated by the known priority ladder. Only roles whose priority is
  // known AND strictly lower than the acting user's priority are kept.
  // website-admin bypasses that gate and sees the full catalog.
  const allAuthentikGroupNames = await listAuthentikGroups();
  const grantableKnownRoleNames = new Set(
    Object.entries(rolesMetadata)
      .filter(([r, { priority }]) => priority < userPriority && r !== "user")
      .map(([roleName]) => roleName),
  );

  const canEditRoles = isWebsiteAdmin
    ? allAuthentikGroupNames.map((g) => g.name)
    : userPriority <= targetPriority &&
        userPriority < rolesMetadata["website-admin"].priority
      ? []
      : allAuthentikGroupNames
          .filter((g) => grantableKnownRoleNames.has(g.name))
          .map((g) => g.name);

  const connections: { discord?: string; minecraft?: string } = {};

  // get the user connections
  const accounts = await db.query.account.findMany({
    where: eq(account.userId, target.id),
  });

  // discord connection
  if (
    user?.user.id === target.id ||
    (await hasPermission({ headers, permissions: { userConnections: ["view-discord"] } }))
  ) {
    const discordAccount = accounts.find((a) => a.providerId === "discord");
    if (discordAccount !== undefined) {
      connections.discord = discordAccount.accountId;
    }
  }

  // minecraft connection
  if (
    user?.user.id === target.id ||
    (await hasPermission({
      headers,
      permissions: { userConnections: ["view-minecraft"] },
    }))
  ) {
    const minecraftAccount = await db.query.minecraftUsernames.findFirst({
      where: eq(minecraftUsernames.userId, target.id),
    });
    if (minecraftAccount !== undefined) {
      connections.minecraft = minecraftAccount.username;
    }
  }

  const { success: canSyncRoles } = await auth.api.userHasPermission({
    body: {
      userId: target.id,
      permissions: { user: ["sync-roles"] },
    },
  });

  return ApiResponse.json({
    user: {
      id: target.id,
      name: target.name,
      image: target.image,
      roles:
        target.role
          ?.split(",")
          .map((r) => r.trim())
          .filter(Boolean) ?? [],
      banned: target.banned,
      login: target.login,
      updatedAt: target.updatedAt,
      createdAt: target.createdAt,
    },
    connections,
    canEditRoles,
    canSyncRoles,
  });
};

export const GET = async (
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]">,
) => {
  const params = await ctx.params;
  const originUserLogin = params.userId;

  return getUser(originUserLogin);
};

export const POST = async (
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]">,
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
      roles: z.array(z.string().min(1)),
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

    const originUserRoles = originUser.user.role?.split(",").filter((r) => r in rolesMetadata) ?? [];
    // website-admin may grant any role in the live Authentik catalog,
    // including those not present in the rolesMetadata priority ladder.
    const isWebsiteAdmin = originUserRoles.includes("website-admin");

    const targetUserRoles = targetUser.role?.split(",") ?? [];

    // check that the target user has a lower priority than the origin user
    const originUserMaxPriority = priorityOf(originUserRoles);
    const targetUserMaxPriority = priorityOf(targetUserRoles);

    if (
      targetUserMaxPriority >= originUserMaxPriority &&
      originUserMaxPriority < rolesMetadata["website-admin"].priority
    )
      return ApiResponse.unauthorized(
        "The target user has a greater priority than yours. You can't edit their roles",
      );

    // every submitted role must correspond to a group that actually exists
    // in the configured Authentik instance
    const validAuthentikGroupNames = await getValidAuthentikGroupNames();
    for (const role of parsed.data.roles) {
      if (!validAuthentikGroupNames.has(role))
        return ApiResponse.unauthorized(`Unknown role \`${role}\`.`);
    }

    // check that the origin user can give / remove the roles he has given / removed
    const newRoles = parsed.data.roles.filter((r) => !targetUserRoles.includes(r));
    const removedRoles = targetUserRoles.filter((r) => !parsed.data.roles!.includes(r));

    const editedRoles = [...newRoles, ...removedRoles];

    for (const role of editedRoles) {
      // Unknown Authentik role: not in the priority ladder. website-admin
      // bypasses this gate and may grant any catalog role. Lower-tier users
      // cannot grant unknown roles.
      if (!(role in rolesMetadata)) {
        if (!isWebsiteAdmin)
          return ApiResponse.unauthorized(`Unknown role \`${role}\`.`);
        continue;
      }
      const priority = rolesMetadata[role as keyof typeof rolesMetadata].priority;
      // website-admin may also grant roles whose priority is at or above their
      // own priority (e.g. website-admin itself). Lower-tier users cannot
      // promote beyond their own priority.
      if (priority >= originUserMaxPriority && !isWebsiteAdmin)
        return ApiResponse.unauthorized(
          `You can't edit the role ${role}. You don't have the required permissions.`,
        );
    }

    // order the roles by their known priority (unknown sorts as 0 = neutral)
    parsed.data.roles = parsed.data.roles.toSorted((a, b) => {
      const pa = a in rolesMetadata ? rolesMetadata[a as keyof typeof rolesMetadata].priority : 0;
      const pb = b in rolesMetadata ? rolesMetadata[b as keyof typeof rolesMetadata].priority : 0;
      return pb - pa;
    });
  }

  const updatedUser = await db
    .update(user)
    .set({ ...parsed.data, role: parsed.data.roles?.join(",") })
    .where(eq(user.id, targetUser.id))
    .returning();

  if (updatedUser.length === 0) return ApiResponse.internalServerError();

  if (parsed.data.roles !== undefined) {
    await performUserRoleSync(targetUser.login);
  }

  return ApiResponse.json({
    id: updatedUser[0].id,
    name: updatedUser[0].name,
    image: updatedUser[0].image,
    roles:
      updatedUser[0].role
        ?.split(",")
        .map((r) => r.trim())
        .filter(Boolean) ?? [],
    banned: updatedUser[0].banned,
    login: updatedUser[0].login,
    updatedAt: updatedUser[0].updatedAt,
    createdAt: updatedUser[0].createdAt,
  });
};
