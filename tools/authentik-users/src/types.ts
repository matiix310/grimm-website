export interface UserInput {
  login: string;
  display_name?: string;
  added_groups?: string[];
  removed_groups?: string[];
}

export interface UsersFile {
  users: UserInput[];
}

export interface AuthentikGroup {
  pk: string;
  name: string;
  is_superuser: boolean;
  attributes: Record<string, unknown> | null;
  group_uuid: string;
}

export interface AuthentikUserAttributes {
  oidc_iss: string | null;
  oidc_sub: string;
  "goauthentik.io/user/sources": string[];
  [key: string]: unknown;
}

export interface AuthentikUser {
  pk: number;
  username: string;
  name: string;
  email: string;
  is_active: boolean;
  path: string;
  groups: string[]; // group pks
  attributes: AuthentikUserAttributes | Record<string, unknown>;
}

export interface AuthentikApiError {
  detail?: string;
  [key: string]: unknown;
}

export type Action = "create" | "update" | "noop";

export interface UserResult {
  login: string;
  action: Action;
  pk?: number;
  error?: string;
}