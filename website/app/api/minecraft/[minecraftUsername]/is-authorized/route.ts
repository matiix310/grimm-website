import { db } from "@/db";
import { minecraftAuthorizations } from "@/db/schema/minecraftAuthorizations";
import { minecraftUsernames } from "@/db/schema/minecraftUsernames";
import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { and, desc, eq, gt } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  ctx: RouteContext<"/api/minecraft/[minecraftUsername]/is-authorized">
) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { minecraft: ["check-authorization"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ minecraft: ["check-authorization"] });

  const params = await ctx.params;
  const minecraftUsername = params.minecraftUsername;

  // Get the player
  const link = await db.query.minecraftUsernames.findFirst({
    where: eq(minecraftUsernames.username, minecraftUsername),
  });

  if (link === undefined) return ApiResponse.notFound("Minecraft account not found");

  const lastValidAuthorization = await db.query.minecraftAuthorizations.findFirst({
    where: and(
      eq(minecraftAuthorizations.username, minecraftUsername),
      eq(minecraftAuthorizations.used, false),
      gt(minecraftAuthorizations.createdAt, new Date(new Date().getTime() - 30000))
    ),
    orderBy: desc(minecraftAuthorizations.createdAt),
  });

  if (lastValidAuthorization === undefined) return ApiResponse.unauthorized();

  // Invalidate all authorized session for this user
  await db
    .update(minecraftAuthorizations)
    .set({ used: true })
    .where(
      and(
        eq(minecraftAuthorizations.username, minecraftUsername),
        eq(minecraftAuthorizations.used, false)
      )
    );

  return ApiResponse.json({});
};
