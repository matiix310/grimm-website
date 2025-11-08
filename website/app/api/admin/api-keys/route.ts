import ApiResponse from "@/lib/apiResponse";
import { auth } from "@/lib/auth";
import { apiSafeStatement, Permissions } from "@/lib/permissions";
import { hasPermission } from "@/utils/auth";
import { headers as nextHeaders } from "next/headers";
import { NextRequest } from "next/server";
import z from "zod";

export const PUT = async (request: NextRequest) => {
  const headers = await nextHeaders();
  if (
    !(await hasPermission({
      headers,
      permissions: { "api-keys": ["create"] },
      onlyUsers: true,
    }))
  )
    return ApiResponse.unauthorizedPermission({ "api-keys": ["create"] });

  const user = await auth.api.getSession({
    headers,
  });

  if (!user) return ApiResponse.notFoundUser();

  const json = await request.json().catch(() => null);

  if (json === null) return ApiResponse.badRequestBodyParsing();

  const permissions = z
    .partialRecord(
      z.union(
        Object.keys(apiSafeStatement).map((p) =>
          z.literal(p as keyof typeof apiSafeStatement)
        )
      ),
      z.array(z.string()).nonempty()
    )
    .refine((perms) => {
      console.log(perms);
      for (const perm in perms) {
        for (const subPerm of perms[perm as keyof typeof apiSafeStatement]!)
          if (!(apiSafeStatement as Record<string, string[]>)[perm].includes(subPerm))
            return false;
      }
      return true;
    });

  const parsed = z
    .object({
      name: z.string().nonempty(),
      expiresIn: z.number().positive(),
      permissions: z.optional(permissions),
    })
    .safeParse(json);

  if (parsed.error) return ApiResponse.badRequestBodyValidation(parsed.error.issues);

  // verify that the user has the permissions he asks
  if (
    parsed.data.permissions &&
    !(await auth.api.userHasPermission({
      body: {
        permissions: parsed.data.permissions as Permissions,
      },
      headers,
    }))
  )
    return ApiResponse.unauthorized("You can't request permissions you don't have");

  const key = await auth.api.createApiKey({
    body: {
      ...parsed.data,
      userId: user?.user.id,
      rateLimitEnabled: false,
      remaining: null,
    },
  });

  return ApiResponse.json(key);
};
