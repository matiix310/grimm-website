import { db } from "@/db";
import { minecraftUsernames } from "@/db/schema/minecraftUsernames";
import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  ctx: RouteContext<"/api/minecraft/[minecraftUsername]">
) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { userConnections: ["view-minecraft"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ userConnections: ["view-minecraft"] });

  const params = await ctx.params;
  const minecraftUsername = params.minecraftUsername;

  const minecraftAccount = await db.query.minecraftUsernames.findFirst({
    where: eq(minecraftUsernames.username, minecraftUsername),
    with: {
      user: {
        columns: {
          login: true,
        },
      },
    },
  });

  if (minecraftAccount === undefined)
    return ApiResponse.notFound("Minecraft account not found");

  return ApiResponse.json({
    login: minecraftAccount.user.login,
    updatedAt: minecraftAccount.updatedAt,
    createdAt: minecraftAccount.createdAt,
  });
};
