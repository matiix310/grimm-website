import { db } from "@/db";
import { redeemCodes } from "@/db/schema/redeemCodes";
import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import z from "zod";
import { createId } from "@paralleldrive/cuid2";

export const POST = async (
  request: NextRequest,
  ctx: RouteContext<"/api/admin/codes/[codeId]">
) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { codes: ["update"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ codes: ["update"] });

  // check that the code is valid
  const params = await ctx.params;
  const code = await db.query.redeemCodes.findFirst({
    where: eq(redeemCodes.id, params.codeId),
  });

  if (!code) return ApiResponse.notFound("Code not found");

  const json = await request.json().catch(() => null);

  if (json === null) return ApiResponse.badRequestBodyParsing();

  const parsed = z
    .object({
      maxUsage: z.number().positive(),
      name: z.string().nonempty(),
      points: z.number(),
    })
    .partial()
    .safeParse(json);

  if (parsed.error) return ApiResponse.badRequestBodyValidation(parsed.error.issues);

  // edit the code
  const newCode = await db
    .update(redeemCodes)
    .set({
      ...parsed.data,
    })
    .returning();

  if (newCode.length < 1) return ApiResponse.internalServerError();

  return ApiResponse.json(newCode[0]);
};

export const DELETE = async (
  request: NextRequest,
  ctx: RouteContext<"/api/admin/codes/[codeId]">
) => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { codes: ["delete"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ codes: ["delete"] });

  // check that the code is valid
  const params = await ctx.params;
  const code = await db.query.redeemCodes.findFirst({
    where: eq(redeemCodes.id, params.codeId),
  });

  if (!code) return ApiResponse.notFound("Code not found");

  // delete the code
  const deletedCode = await db
    .delete(redeemCodes)
    .where(eq(redeemCodes.id, code.id))
    .returning();

  if (deletedCode.length < 1) return ApiResponse.internalServerError();

  return ApiResponse.json(deletedCode[0]);
};
