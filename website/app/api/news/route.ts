import { db } from "@/db";
import { news, newsInsertSchema } from "@/db/schema/news";
import { hasPermission } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const GET = async () => {
  const news = await db.query.news.findMany();

  return NextResponse.json({ error: false, data: news });
};

export const PUT = async (request: NextRequest) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { news: ["create"] },
    }))
  )
    return NextResponse.json({
      error: true,
      message: "You don't have the required permissions to use this endpoint",
    });

  // get the request body
  const json = await request.json().catch(() => null);

  if (json === null)
    return NextResponse.json({ error: true, message: "Invalid json body" });

  const parsed = newsInsertSchema
    .pick({ name: true, description: true, image: true })
    .safeParse(json);

  if (parsed.error)
    return NextResponse.json({
      error: true,
      message: "Invalid body",
      issues: parsed.error.issues,
    });

  // insert the news
  const insertedNews = await db.insert(news).values(parsed.data).returning();

  if (insertedNews.length === 0)
    return NextResponse.json({ error: true, message: "Internal server error" });

  return NextResponse.json({ error: false, data: insertedNews[0] });
};

export const DELETE = async (request: NextRequest) => {
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

  // get the request body
  const json = await request.json().catch(() => null);

  if (json === null)
    return NextResponse.json({ error: true, message: "Invalid json body" });

  // get the available news
  const availableNewsIds = await db.query.news.findMany({ columns: { id: true } });

  const parsed = z
    .object({
      id:
        availableNewsIds.length > 0
          ? z.union(availableNewsIds.map((news) => z.literal(news.id)))
          : z.never(),
    })
    .safeParse(json);

  if (parsed.error)
    return NextResponse.json({
      error: true,
      message: "Invalid body",
      issues: parsed.error.issues,
    });

  // delete the news
  const deletedNews = await db
    .delete(news)
    .where(eq(news.id, parsed.data.id))
    .returning();

  if (deletedNews.length === 0)
    return NextResponse.json({ error: true, message: "Internal server error" });

  return NextResponse.json({ error: false, data: deletedNews[0] });
};
