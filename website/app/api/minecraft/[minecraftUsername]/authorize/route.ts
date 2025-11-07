import { db } from "@/db";
import { minecraftAuthorizations } from "@/db/schema/minecraftAuthorizations";
import { minecraftUsernames } from "@/db/schema/minecraftUsernames";
import ApiResponse from "@/lib/apiResponse";
import { auth } from "@/lib/auth";
import { rateLimiter } from "@/lib/rateLimiter";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export const POST = async (
  request: NextRequest,
  ctx: RouteContext<"/api/minecraft/[minecraftUsername]/authorize">
) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return ApiResponse.unauthorized();

  if (rateLimiter.isLimited("minecraft-authorize", session.user.id))
    return ApiResponse.unauthorized();

  rateLimiter.limit("minecraft-authorize", session.user.id, 5000);

  const params = await ctx.params;
  const minecraftUsername = params.minecraftUsername;

  const link = await db.query.minecraftUsernames.findFirst({
    where: eq(minecraftUsernames.userId, session.user.id),
  });

  if (link === undefined) return ApiResponse.notFound("Minecraft account not found");

  if (link.username !== minecraftUsername)
    return ApiResponse.unauthorized("You are not the owner of this minecraft account");

  // Authorize
  await db.insert(minecraftAuthorizations).values({ username: minecraftUsername });

  return ApiResponse.json({});
};
