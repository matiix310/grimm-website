import { db } from "@/db";
import { account as accountSchema, user as userSchema } from "@/db/schema/auth";
import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { getUser } from "../../users/[userId]/route";

export const GET = async (
  request: NextRequest,
  ctx: RouteContext<"/api/discord/[discordId]">
) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { userConnections: ["view-discord"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ userConnections: ["view-discord"] });

  const params = await ctx.params;
  const discordId = params.discordId;

  const discordAccount = await db.query.account.findFirst({
    where: and(
      eq(accountSchema.providerId, "discord"),
      eq(accountSchema.accountId, discordId)
    ),
  });

  if (discordAccount === undefined)
    return ApiResponse.notFound("Discord account not found");

  const user = await db.query.user.findFirst({
    where: eq(userSchema.id, discordAccount.userId),
    columns: {
      login: true,
    },
  });

  if (user === undefined) return ApiResponse.notFound("User not found");

  return getUser(user.login);
};
