import { db } from "@/db";
import { news, newsUpdateSchema } from "@/db/schema/news";
import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

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
    return ApiResponse.unauthorizedPermission({ news: ["delete"] });

  const params = await ctx.params;
  const newsId = params.newsId;

  // check if the news exists
  const newsExists = !!(await db.query.news.findFirst({
    where: eq(news.id, newsId),
    columns: { id: true },
  }));

  if (!newsExists) return ApiResponse.notFound("News not found");

  // delete the news
  const deletedNews = await db.delete(news).where(eq(news.id, newsId)).returning();

  if (deletedNews.length === 0) return ApiResponse.internalServerError();

  return ApiResponse.json(deletedNews[0]);
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
    return ApiResponse.unauthorizedPermission({ news: ["update"] });

  const params = await ctx.params;
  const newsId = params.newsId;

  // check if the news exists
  const newsExists = !!(await db.query.news.findFirst({
    where: eq(news.id, newsId),
    columns: { id: true },
  }));

  if (!newsExists) return ApiResponse.notFound("News not found");

  // get the request body
  const json = await request.json().catch(() => null);

  if (json === null) return ApiResponse.badRequestBodyParsing();

  const parsed = newsUpdateSchema
    .pick({ name: true, description: true, image: true })
    .refine((obj) => obj.name || obj.description || obj.image, {
      error: "Must have at least one of name, description or image field",
    })
    .safeParse(json);

  if (parsed.error) return ApiResponse.badRequestBodyValidation(parsed.error.issues);

  // update the news
  const updatedNews = await db
    .update(news)
    .set(parsed.data)
    .where(eq(news.id, newsId))
    .returning();

  if (updatedNews.length === 0) return ApiResponse.internalServerError();

  return ApiResponse.json(updatedNews[0]);
};
