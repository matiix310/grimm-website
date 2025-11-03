import { Mutable } from "@/types/misc";

// statements

export const statement = {
  // ======= Default permissions =======
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
  // ===================================

  grimmUser: ["update"],
  points: ["add", "delete"],
  news: ["create", "delete", "update"],
  "api-keys": ["create"],
  ranking: ["force-refresh"],
  minecraft: ["manage-link"],
  codes: ["list", "create", "delete", "update"],
} as const;

export type FullPermissions = typeof statement;

export type Permissions = {
  -readonly [statement in keyof FullPermissions]?: FullPermissions[statement][number][];
};

export const apiSafeStatement: Permissions = {
  user: ["update"],
  points: ["add", "delete"],
  news: ["create", "delete", "update"],
  ranking: ["force-refresh"],
  minecraft: ["manage-link"],
  codes: ["list", "create", "delete", "update"],
};

// roles

export const userRole = {
  user: ["get"],
} satisfies Permissions;

export const managerRole = {
  ...userRole,
  points: ["add", "delete"],
} satisfies Permissions;

export const adminRole = Object.fromEntries(
  Object.entries(statement).map(([k, v]) => [k, [...v]])
) as Mutable<FullPermissions>;

export type AdminRole = typeof adminRole;

// Roles with greater priority can manage the roles below them
export const rolesMetadata = {
  admin: {
    priority: 99,
  },
  manager: {
    priority: 10,
  },
  user: {
    priority: 0,
  },
} as const satisfies Record<string, { priority: number }>;
