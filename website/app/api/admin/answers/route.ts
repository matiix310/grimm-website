import { db } from "@/db";
import { answers } from "@/db/schema/answers";
import { redeemCodes } from "@/db/schema/redeemCodes";
import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { createId } from "@paralleldrive/cuid2";
import { headers, headers as nextHeaders } from "next/headers";
import { NextRequest } from "next/server";
import z from "zod";

export const GET = async () => {
  const headers = await nextHeaders();
  if (
    !(await hasPermission({
      headers,
      permissions: { answers: ["list"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ answers: ["list"] });

  const answers = await db.query.answers.findMany({
    with: { users: { columns: { userId: true, createdAt: true } } },
  });

  return ApiResponse.json(answers);
};

export const PUT = async (request: NextRequest) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { answers: ["create"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ answers: ["create"] });

  const json = await request.json().catch(() => null);

  if (json === null) return ApiResponse.badRequestBodyParsing();

  const parsed = z
    .object({
      name: z.string().nonempty(),
      answer: z.string().nonempty(),
      points: z.number(),
    })
    .safeParse(json);

  if (parsed.error) return ApiResponse.badRequestBodyValidation(parsed.error.issues);

  // insert the answer
  const newAnswer = await db.insert(answers).values(parsed.data).returning();

  if (newAnswer.length < 1) return ApiResponse.internalServerError();

  return ApiResponse.json(newAnswer[0]);
};
