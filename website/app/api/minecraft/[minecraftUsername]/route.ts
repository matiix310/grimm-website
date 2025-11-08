import { db } from "@/db";
import { minecraftUsernames } from "@/db/schema/minecraftUsernames";
import ApiResponse from "@/lib/apiResponse";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  ctx: RouteContext<"/api/minecraft/[minecraftUsername]">
) => {
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
    username: minecraftAccount.username,
    updatedAt: minecraftAccount.updatedAt,
    createdAt: minecraftAccount.createdAt,
  });
};
