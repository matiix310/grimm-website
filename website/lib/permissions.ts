import { Mutable } from "@/types/misc";
import { Roles } from "./auth";

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
    "sync-roles",
  ],
  session: ["list", "revoke", "delete"],
  // ===================================

  grimmUser: ["update"],
  points: ["add", "delete"],
  news: ["create", "delete", "update"],
  events: ["create", "delete", "update"],
  "api-keys": ["create"],
  ranking: ["force-refresh"],
  minecraft: ["manage-link", "check-authorization"],
  codes: ["list", "create", "delete", "update"],
  answers: ["list", "create", "delete", "update"],
  presets: ["view"],
  userConnections: ["view-discord", "view-minecraft"],
  adminPanel: ["access"],
  discord: ["admin"],
} as const;

export type FullPermissions = typeof statement;

export type Permissions = {
  -readonly [statement in keyof FullPermissions]?: FullPermissions[statement][number][];
};

// Only these permissions are allowed in an api key
export const apiSafeStatement: Permissions = {
  user: ["update", "sync-roles"],
  points: ["add", "delete"],
  news: ["create", "delete", "update"],
  events: ["create", "delete", "update"],
  ranking: ["force-refresh"],
  minecraft: ["manage-link", "check-authorization"],
  codes: ["list", "create", "delete", "update"],
  answers: ["list", "create", "delete", "update"],
  presets: ["view"],
  userConnections: ["view-discord"],
};

// roles

export const userRole = {
  user: ["get"],
} satisfies Permissions;

export const adminRole = Object.fromEntries(
  Object.entries(statement).map(([k, v]) => [k, [...v]]),
) as Mutable<FullPermissions>;

export const bureauRole = {
  ...userRole,
} satisfies Permissions;

// respos
export const respoTechRole = {
  ...userRole,
} satisfies Permissions;

export const respoDesignRole = {
  ...userRole,
} satisfies Permissions;

export const respoComRole = {
  ...userRole,
} satisfies Permissions;

export const respoAssistantsRole = {
  ...userRole,
} satisfies Permissions;

export const respoWeiRole = {
  ...userRole,
} satisfies Permissions;

export const respoInterRole = {
  ...userRole,
} satisfies Permissions;

export const respoVJRole = {
  ...userRole,
} satisfies Permissions;

export const respoEventRole = {
  ...userRole,
  adminPanel: ["access"],
  events: ["create", "delete", "update"],
} satisfies Permissions;

export const respoMerchRole = {
  ...userRole,
} satisfies Permissions;

export const respoPartRole = {
  ...userRole,
} satisfies Permissions;

export const respoTresoRole = {
  ...userRole,
} satisfies Permissions;

// teams
export const teamTechRole = {
  ...userRole,
} satisfies Permissions;

export const teamDesignRole = {
  ...userRole,
} satisfies Permissions;

export const teamComRole = {
  ...userRole,
} satisfies Permissions;

export const teamEventRole = {
  ...userRole,
} satisfies Permissions;

export const teamPartRole = {
  ...userRole,
} satisfies Permissions;

export const teamTresoRole = {
  ...userRole,
} satisfies Permissions;

// members
export const memberRole = {
  ...userRole,
} satisfies Permissions;

export const staffRole = {
  ...userRole,
} satisfies Permissions;

export type AdminRole = typeof adminRole;

// Roles with greater priority can manage the roles below them
export const rolesMetadata = {
  admin: {
    priority: 99,
    backgroundColor: "var(--yellow)",
    foregroundColor: "var(--on-yellow)",
    displayName: "Admin",
  },
  bureau: {
    priority: 90,
    backgroundColor: "#e36335",
    foregroundColor: "#ffffff",
    displayName: "Bureau",
  },
  respoTech: {
    priority: 80,
    backgroundColor: "#f5a90d",
    foregroundColor: "#ffffff",
    displayName: "Respo Tech",
  },
  respoDesign: {
    priority: 80,
    backgroundColor: "#f5a90d",
    foregroundColor: "#ffffff",
    displayName: "Respo Design",
  },
  respoCom: {
    priority: 80,
    backgroundColor: "#f5a90d",
    foregroundColor: "#ffffff",
    displayName: "Respo Com",
  },
  respoAssistants: {
    priority: 80,
    backgroundColor: "#f5a90d",
    foregroundColor: "#ffffff",
    displayName: "Respo Assistants",
  },
  respoWei: {
    priority: 80,
    backgroundColor: "#f5a90d",
    foregroundColor: "#ffffff",
    displayName: "Respo Wei",
  },
  respoInter: {
    priority: 80,
    backgroundColor: "#f5a90d",
    foregroundColor: "#ffffff",
    displayName: "Respo Inter",
  },
  respoVJ: {
    priority: 80,
    backgroundColor: "#f5a90d",
    foregroundColor: "#ffffff",
    displayName: "Respo VJ",
  },
  respoEvent: {
    priority: 80,
    backgroundColor: "#f5a90d",
    foregroundColor: "#ffffff",
    displayName: "Respo Events",
  },
  respoMerch: {
    priority: 80,
    backgroundColor: "#f5a90d",
    foregroundColor: "#ffffff",
    displayName: "Respo Merch",
  },
  respoPart: {
    priority: 80,
    backgroundColor: "#f5a90d",
    foregroundColor: "#ffffff",
    displayName: "Respo Part",
  },
  respoTreso: {
    priority: 80,
    backgroundColor: "#f5a90d",
    foregroundColor: "#ffffff",
    displayName: "Respo Treso",
  },
  teamTech: {
    priority: 50,
    backgroundColor: "#3498DB",
    foregroundColor: "#ffffff",
    displayName: "Team Tech",
  },
  teamDesign: {
    priority: 50,
    backgroundColor: "#3498DB",
    foregroundColor: "#ffffff",
    displayName: "Team Design",
  },
  teamCom: {
    priority: 50,
    backgroundColor: "#3498DB",
    foregroundColor: "#ffffff",
    displayName: "Team Com",
  },
  teamEvent: {
    priority: 50,
    backgroundColor: "#3498DB",
    foregroundColor: "#ffffff",
    displayName: "Team Event",
  },
  teamPart: {
    priority: 50,
    backgroundColor: "#3498DB",
    foregroundColor: "#ffffff",
    displayName: "Team Part",
  },
  teamTreso: {
    priority: 50,
    backgroundColor: "#3498DB",
    foregroundColor: "#ffffff",
    displayName: "Team Treso",
  },
  member: {
    priority: 30,
    backgroundColor: "#4CA66E",
    foregroundColor: "#ffffff",
    displayName: "Membre",
  },
  staff: {
    priority: 10,
    backgroundColor: "#333028",
    foregroundColor: "#FFF4DA",
    displayName: "Staff",
  },
  user: {
    priority: 0,
    backgroundColor: "var(--secondary)",
    foregroundColor: "var(--on-secondary)",
    displayName: "Utilisateur",
  },
} as const satisfies Record<
  Roles,
  {
    priority: number;
    backgroundColor: string;
    foregroundColor: string;
    displayName: string;
  }
>;
