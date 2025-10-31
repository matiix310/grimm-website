import { defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  points: ["add", "delete"],
  news: ["create", "delete"],
  "api-keys": ["create"],
  ranking: ["force-refresh"],
} as const;

export type Permissions = typeof statement;

export const apiSafeStatement: {
  [key in keyof Permissions]?: Permissions[key][number][];
} = {
  user: ["update"],
  points: ["add", "delete"],
  news: ["create", "delete"],
  ranking: ["force-refresh"],
};
