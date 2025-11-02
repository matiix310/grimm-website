import { db } from "@/db";
import { news, newsUpdateSchema } from "@/db/schema/news";
import { hasPermission } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (
  request: NextRequest,
  ctx: RouteContext<"/api/news/[newsId]">
) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { news: ["delete"] },
    }))
  )
    return NextResponse.json({
      error: true,
      message: "You don't have the required permissions to use this endpoint",
    });

  const params = await ctx.params;
  const newsId = params.newsId;

  // check if the news exists
  const newsExists = !!(await db.query.news.findFirst({
    where: eq(news.id, newsId),
    columns: { id: true },
  }));

  if (!newsExists) return NextResponse.json({ error: true, message: "News not found" });

  // delete the news
  const deletedNews = await db.delete(news).where(eq(news.id, newsId)).returning();

  if (deletedNews.length === 0)
    return NextResponse.json({ error: true, message: "Internal server error" });

  return NextResponse.json({ error: false, data: deletedNews[0] });
};

export const POST = async (
  request: NextRequest,
  ctx: RouteContext<"/api/news/[newsId]">
) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { news: ["update"] },
    }))
  )
    return NextResponse.json({
      error: true,
      message: "You don't have the required permissions to use this endpoint",
    });

  const params = await ctx.params;
  const newsId = params.newsId;

  // check if the news exists
  const newsExists = !!(await db.query.news.findFirst({
    where: eq(news.id, newsId),
    columns: { id: true },
  }));

  if (!newsExists) return NextResponse.json({ error: true, message: "News not found" });

  // get the request body
  const json = await request.json().catch(() => null);

  if (json === null)
    return NextResponse.json({ error: true, message: "Invalid json body" });

  const parsed = newsUpdateSchema
    .pick({ name: true, description: true, image: true })
    .refine((obj) => obj.name || obj.description || obj.image, {
      error: "Must have at least one of name, description or image field",
    })
    .safeParse(json);

  if (parsed.error)
    return NextResponse.json({
      error: true,
      message: "Invalid body",
      issues: parsed.error.issues,
    });

  // update the news
  const updatedNews = await db
    .update(news)
    .set(parsed.data)
    .where(eq(news.id, newsId))
    .returning();

  if (updatedNews.length === 0)
    return NextResponse.json({ error: true, message: "Internal server error" });

  return NextResponse.json({ error: false, data: updatedNews[0] });
};
