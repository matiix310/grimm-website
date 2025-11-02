import { db } from "@/db";
import { ranking } from "@/db/schema/ranking";
import ApiResponse from "@/lib/apiResponse";
import { count } from "drizzle-orm";
import { NextRequest } from "next/server";
import z from "zod";

export const GET = async (request: NextRequest) => {
  const params = {
    limit: request.nextUrl.searchParams.get("limit"),
    offset: request.nextUrl.searchParams.get("offset"),
  };

  const parsed = z
    .object({
      limit: z.coerce.number().positive().max(20),
      offset: z.coerce.number().min(0),
    })
    .safeParse(params);

  if (parsed.error) return ApiResponse.badRequestQueryValidation(parsed.error.issues);

  const rankingResult = await db.query.ranking.findMany({
    orderBy: (ranking, { asc }) => [asc(ranking.rank)],
    offset: parsed.data.offset,
    limit: parsed.data.limit,
    columns: { rank: true, points: true },
    with: {
      user: {
        columns: {
          login: true,
          name: true,
        },
      },
    },
  });

  const totalResult = await db.select({ total: count() }).from(ranking);

  if (totalResult.length === 0) return ApiResponse.internalServerError();

  return ApiResponse.json({
    ...parsed.data,
    total: totalResult[0].total,
    ranking: rankingResult,
  });
};
