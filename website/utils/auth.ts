import { auth, type Roles } from "@/lib/auth";
import { Permissions } from "@/lib/permissions";
import { headers as nextHeaders } from "next/headers";

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
    const user = await auth.api.getSession({ headers: options.headers });
    if (!user || user.user.banned) return false;

    const { error, success } = await auth.api.userHasPermission({
      body: {
        userId: user.user.id,
        permissions: options.permissions,
        role: options.role,
      },
    });

    return !error && success;
  }
};

export { hasPermission };
export type { Permissions };
