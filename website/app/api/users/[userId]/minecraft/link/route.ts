import { db } from "@/db";
import { user as userSchema } from "@/db/schema/auth";
import { minecraftUsernames } from "@/db/schema/minecraftUsernames";
import ApiResponse from "@/lib/apiResponse";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { headers as nextHeaders } from "next/headers";
import { NextRequest } from "next/server";
import z from "zod";

export const GET = async (
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]/minecraft/link">
) => {
  const params = await ctx.params;
  const userLogin = params.userId;

  const user = await db.query.user.findFirst({
    where: eq(userSchema.login, userLogin),
    columns: {
      id: true,
    },
  });

  if (!user) return ApiResponse.notFoundUser();

  const minecraftUsername = await db.query.minecraftUsernames.findFirst({
    where: eq(minecraftUsernames.userId, user.id),
  });

  if (!minecraftUsername) return ApiResponse.notFound("Minecraft account not found");

  return ApiResponse.json(minecraftUsername);
};

export const POST = async (
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]/minecraft/link">
) => {
  let isAdmin = true;

  const headers = await nextHeaders();
  const params = await ctx.params;
  const userLogin = params.userId;

  if (!(await hasPermission({ headers, permissions: { minecraft: ["manage-link"] } }))) {
    if (!((await auth.api.getSession({ headers }))?.user.login === userLogin))
      return ApiResponse.unauthorizedPermission({ minecraft: ["manage-link"] });

    isAdmin = false;
  }

  // validate the body content
  const json = await request.json().catch(() => null);

  if (json === null) return ApiResponse.badRequestBodyParsing();

  const parsed = z
    .object({
      username: z.string().nonempty(),
    })
    .safeParse(json);

  if (parsed.error) return ApiResponse.badRequestBodyValidation(parsed.error.issues);

  const user = await db.query.user.findFirst({
    where: eq(userSchema.login, userLogin),
    columns: {
      id: true,
    },
  });

  if (!user) return ApiResponse.notFoundUser();

  const minecraftUsername = await db.query.minecraftUsernames.findFirst({
    where: eq(minecraftUsernames.userId, user.id),
  });

  if (minecraftUsername && !isAdmin)
    return ApiResponse.badRequest("You are already linked to another minecraft account"); // TODO: bad request?

  // edit or create depending on user permissions
  const newMinecraftUsername = await (minecraftUsername && isAdmin
    ? db
        .update(minecraftUsernames)
        .set({ username: parsed.data.username })
        .where(eq(minecraftUsernames.userId, user.id))
        .returning()
    : db
        .insert(minecraftUsernames)
        .values({ userId: user.id, username: parsed.data.username })
        .returning());

  if (newMinecraftUsername.length === 0) return ApiResponse.internalServerError();

  return ApiResponse.json(newMinecraftUsername[0]);
};

// TODO Delete
