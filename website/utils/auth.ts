import { auth, type Roles } from "@/lib/auth";
import { Permissions as AuthPermissions } from "@/lib/authStatement";
import { headers as nextHeaders } from "next/headers";

type Permissions = {
  [statement in keyof AuthPermissions]?: AuthPermissions[statement][number][];
};

// check user and api-key permissions
// avoid using role and user the permissions instead
const hasPermission = async (options: {
  headers: Awaited<ReturnType<typeof nextHeaders>>;
  permissions: Permissions;
  role?: Roles;
  onlyUsers?: boolean;
}): Promise<boolean> => {
  const apiKey = options.headers.get("x-api-key");
  if (!options.onlyUsers && apiKey) {
    const { valid, error } = await auth.api.verifyApiKey({
      body: {
        key: apiKey,
        permissions: options.permissions,
      },
    });

    return !error && valid;
  } else {
    const { error, success } = await auth.api.userHasPermission({
      body: {
        permissions: options.permissions,
        role: options.role,
      },
      headers: options.headers,
    });

    return !error && success;
  }
};

export { hasPermission };
export type { Permissions };
