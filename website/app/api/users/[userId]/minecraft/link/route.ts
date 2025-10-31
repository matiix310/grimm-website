import { db } from "@/db";
import { user as userSchema } from "@/db/schema/auth";
import { minecraftUsernames } from "@/db/schema/minecraftUsernames";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { headers as nextHeaders } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
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

  if (!user) return NextResponse.json({ error: true, message: "User not found" });

  const minecraftUsername = await db.query.minecraftUsernames.findFirst({
    where: eq(minecraftUsernames.userId, user.id),
  });

  if (!minecraftUsername)
    return NextResponse.json({
      error: true,
      message: "User not linked with a minecraft account",
    });

  return NextResponse.json({ error: false, data: minecraftUsername });
};

export const POST = async (
  request: NextRequest,
  ctx: RouteContext<"/api/users/[userId]/minecraft/link">
) => {
  let isAdmin = true;

  const headers = await nextHeaders();
  const params = await ctx.params;
  const userLogin = params.userId;

  if (!(await hasPermission({ headers, permissions: { user: ["update"] } }))) {
    if (!((await auth.api.getSession({ headers }))?.user.login === userLogin))
      return NextResponse.json({
        error: true,
        message: "You don't have the required permissions to use this endpoint",
      });

    isAdmin = false;
  }

  // validate the body content
  const json = await request.json().catch(() => null);

  if (json === null)
    return NextResponse.json({ error: true, message: "Invalid json body" });

  const parsed = z
    .object({
      username: z.string(),
    })
    .safeParse(json);

  if (parsed.error)
    return NextResponse.json({
      error: true,
      message: "Invalid body",
      issues: parsed.error.issues,
    });

  const user = await db.query.user.findFirst({
    where: eq(userSchema.login, userLogin),
    columns: {
      id: true,
    },
  });

  if (!user) return NextResponse.json({ error: true, message: "User not found" });

  const minecraftUsername = await db.query.minecraftUsernames.findFirst({
    where: eq(minecraftUsernames.userId, user.id),
  });

  if (minecraftUsername && !isAdmin)
    return NextResponse.json({
      error: true,
      message: "You are already linked to another minecraft account",
    });

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

  if (newMinecraftUsername.length === 0)
    return NextResponse.json({ error: true, message: "Internal server error" });

  return NextResponse.json({ error: false, data: newMinecraftUsername[0] });
};

// TODO Delete
