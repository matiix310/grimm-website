import { auth } from "@/lib/auth";
import { apiSafeStatement } from "@/lib/authStatement";
import { hasPermission } from "@/utils/auth";
import { headers as nextHeaders } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json({
      error: true,
      message: "You don't have the required permissions to use this endpoint",
    });

  const user = await auth.api.getSession({
    headers,
  });

  if (!user) return NextResponse.json({ error: true, message: "Internal server error" });

  const json = await request.json().catch(() => null);

  if (json === null)
    return NextResponse.json({ error: true, message: "Invalid json body" });

  const permissions = z
    .record(
      z.union(Object.keys(apiSafeStatement).map((p) => z.literal(p))),
      z.array(z.string()).nonempty()
    )
    .refine((perms) => {
      for (const perm in perms) {
        for (const subPerm in perms[perm])
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

  if (parsed.error)
    return NextResponse.json({
      error: true,
      message: "Invalid body",
      issues: parsed.error.issues,
    });

  // verify that the user has the permissions he asks
  if (
    parsed.data.permissions &&
    !(await auth.api.userHasPermission({
      body: {
        permissions: parsed.data.permissions,
      },
      headers,
    }))
  )
    return NextResponse.json({
      error: true,
      message: "You can't request permissions you don't have",
    });

  const key = await auth.api.createApiKey({
    body: { ...parsed.data, userId: user?.user.id },
  });

  return NextResponse.json({ error: false, data: key });
};
