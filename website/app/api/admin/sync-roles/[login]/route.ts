import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { headers as nextHeaders } from "next/headers";
import { performUserRoleSync } from "@/lib/sync-roles";
import { NextRequest } from "next/server";

export const POST = async (
  request: NextRequest,
  ctx: { params: Promise<{ login: string }> }
) => {
  // Check permissions - requires user:sync-roles permission
  if (
    !(await hasPermission({
      headers: await nextHeaders(),
      permissions: { user: ["sync-roles"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ user: ["sync-roles"] });

  const params = await ctx.params;
  const login = params.login;

  // Perform the sync using the shared function
  const result = await performUserRoleSync(login);

  if (!result.success) {
    if (result.message.includes("not found")) {
      return ApiResponse.notFound(result.message);
    }
    return ApiResponse.internalServerError(result.message);
  }

  return ApiResponse.json(result);
};
