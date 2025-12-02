import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { headers as nextHeaders } from "next/headers";
import { performRoleSync } from "@/lib/sync-roles";

export const POST = async () => {
  // Check permissions - requires user:sync-roles permission
  if (
    !(await hasPermission({
      headers: await nextHeaders(),
      permissions: { user: ["sync-roles"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ user: ["sync-roles"] });

  // Perform the sync using the shared function
  const result = await performRoleSync();

  if (!result.success) {
    return ApiResponse.internalServerError(result.message);
  }

  return ApiResponse.json(result);
};
