import { db } from "@/db";
import { answers } from "@/db/schema/answers";
import { redeemCodes } from "@/db/schema/redeemCodes";
import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import z from "zod";

export const POST = async (
  request: NextRequest,
  ctx: RouteContext<"/api/admin/answers/[answerId]">
) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { answers: ["update"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ answers: ["update"] });

  // check that the answer exists
  const params = await ctx.params;
  const answer = await db.query.answers.findFirst({
    where: eq(redeemCodes.id, params.answerId),
  });

  if (!answer) return ApiResponse.notFound("Answer not found");

  const json = await request.json().catch(() => null);

  if (json === null) return ApiResponse.badRequestBodyParsing();

  const parsed = z
    .object({
      name: z.string().nonempty(),
      answer: z.string().nonempty(),
      points: z.number(),
    })
    .partial()
    .safeParse(json);

  if (parsed.error) return ApiResponse.badRequestBodyValidation(parsed.error.issues);

  // edit the answer
  const newAnswer = await db.update(answers).set(parsed.data).returning();

  if (newAnswer.length < 1) return ApiResponse.internalServerError();

  return ApiResponse.json(newAnswer[0]);
};

export const DELETE = async (
  request: NextRequest,
  ctx: RouteContext<"/api/admin/answers/[answerId]">
) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { answers: ["delete"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ answers: ["delete"] });

  // check that the answer exists
  const params = await ctx.params;
  const answer = await db.query.answers.findFirst({
    where: eq(answers.id, params.answerId),
  });

  if (!answer) return ApiResponse.notFound("Answer not found");

  // delete the answer
  const deletedAnswer = await db
    .delete(answers)
    .where(eq(answers.id, answer.id))
    .returning();

  if (deletedAnswer.length < 1) return ApiResponse.internalServerError();

  return ApiResponse.json(deletedAnswer[0]);
};
