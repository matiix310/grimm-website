import { db } from "@/db";
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
      permissions: { codes: ["list"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ codes: ["list"] });

  const codes = await db.query.redeemCodes.findMany({
    with: { users: { columns: { userId: true, createdAt: true } } },
  });

  return ApiResponse.json(codes);
};

export const PUT = async (request: NextRequest) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { codes: ["create"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ codes: ["create"] });

  const json = await request.json().catch(() => null);

  if (json === null) return ApiResponse.badRequestBodyParsing();

  const parsed = z
    .object({
      maxUsage: z.number().positive().optional(),
      name: z.string().nonempty(),
      points: z.number(),
    })
    .safeParse(json);

  if (parsed.error) return ApiResponse.badRequestBodyValidation(parsed.error.issues);

  // insert the code
  const newCode = await db
    .insert(redeemCodes)
    .values({ ...parsed.data, code: createId() })
    .returning();

  if (newCode.length < 1) return ApiResponse.internalServerError();

  return ApiResponse.json(newCode[0]);
};
