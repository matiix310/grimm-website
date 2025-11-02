import { db } from "@/db";
import { news, newsInsertSchema } from "@/db/schema/news";
import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export const GET = async () => {
  const news = await db.query.news.findMany();

  return ApiResponse.json(news);
};

export const PUT = async (request: NextRequest) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { news: ["create"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ news: ["create"] });

  // get the request body
  const json = await request.json().catch(() => null);

  if (json === null) return ApiResponse.badRequestBodyParsing();

  const parsed = newsInsertSchema
    .pick({ name: true, description: true, image: true })
    .safeParse(json);

  if (parsed.error) return ApiResponse.badRequestBodyValidation(parsed.error.issues);

  // insert the news
  const insertedNews = await db.insert(news).values(parsed.data).returning();

  if (insertedNews.length === 0) return ApiResponse.internalServerError();

  return ApiResponse.json(insertedNews[0]);
};
