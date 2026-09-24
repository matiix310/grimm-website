import type { AuthentikClient } from "./authentik";
import type { AuthentikUserAttributes, UserInput, UserResult } from "./types";
import { logger } from "./logger";

export const FORGE_ID_SOURCE_PATH = "goauthentik.io/sources/forge-id";
export const FORGE_ID_SOURCE_LABEL = "FORGE ID";

export function buildAttributes(
  username: string,
): AuthentikUserAttributes {
  return {
    oidc_iss: null,
    oidc_sub: username,
    "goauthentik.io/user/sources": [FORGE_ID_SOURCE_LABEL],
  };
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a === "object") {
    const ak = Object.keys(a as Record<string, unknown>);
    const bk = Object.keys(b as Record<string, unknown>);
    if (ak.length !== bk.length) return false;
    for (const k of ak) {
      if (
        !deepEqual(
          (a as Record<string, unknown>)[k],
          (b as Record<string, unknown>)[k],
        )
      )
        return false;
    }
    return true;
  }
  return false;
}

export function sameStringSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

interface UpsertUserOptions {
  apply: boolean;
}

export async function upsertUser(
  client: AuthentikClient,
  groupPkByName: Map<string, string>,
  input: UserInput,
  options: UpsertUserOptions,
): Promise<UserResult> {
  const { login } = input;
  // display_name is optional — empty/whitespace treated as absent
  const rawDisplay = input.display_name;
  const hasDisplayName =
    typeof rawDisplay === "string" && rawDisplay.trim().length > 0;
  const desiredName = hasDisplayName ? rawDisplay.trim() : login;

  const added = input.added_groups ?? [];
  const removed = input.removed_groups ?? [];

  // Detect conflicts: a group in both added_groups and removed_groups
  const lowerAdded = new Set(added.map((g) => g.toLowerCase()));
  const conflicts = removed.filter((g) => lowerAdded.has(g.toLowerCase()));
  if (conflicts.length > 0) {
    throw new Error(
      `Conflict in user "${login}": group(s) appear in both added_groups and removed_groups: [${conflicts.join(", ")}]. User skipped.`,
    );
  }

  const pksToAdd = added
    .map((name) => groupPkByName.get(name))
    .filter((v): v is string => Boolean(v));
  const pksToRemove = removed
    .map((name) => groupPkByName.get(name))
    .filter((v): v is string => Boolean(v));

  const attributes = buildAttributes(login);

  const existing = await client.findUserByUsername(login);

  if (!existing) {
    // On creation, removed_groups is meaningless (nothing to remove)
    if (removed.length > 0) {
      logger.warn(
        `User "${login}": removed_groups=[${removed.join(", ")}] ignored — user does not exist yet`,
      );
    }
    const desiredGroupPks = pksToAdd;
    const groupLabel =
      desiredGroupPks.length > 0 ? `[${desiredGroupPks.join(", ")}]` : "[]";

    if (!options.apply) {
      logger.dry(
        `Would CREATE user "${login}" (name="${desiredName}", path=${FORGE_ID_SOURCE_PATH}, groups=${groupLabel})`,
      );
      return { login, action: "create" };
    }
    const created = await client.createUser({
      username: login,
      name: desiredName,
      is_active: true,
      path: FORGE_ID_SOURCE_PATH,
      groups: desiredGroupPks,
      attributes,
    });
    logger.success(
      `Created user "${login}" (pk=${created.pk}, name="${created.name}", path=${created.path})`,
    );
    return { login, action: "create", pk: created.pk };
  }

  // user exists — compute desired group set: (current) ∪ added − removed
  const desiredGroupPks = [
    ...new Set(
      [...existing.groups, ...pksToAdd].filter(
        (pk) => !pksToRemove.includes(pk),
      ),
    ),
  ];

  // name: only compared/updated when display_name is explicitly provided;
  // otherwise we leave the existing display name untouched.
  const sameName = hasDisplayName ? existing.name === desiredName : true;
  const samePath = existing.path === FORGE_ID_SOURCE_PATH;
  const sameGroups = sameStringSet(existing.groups, desiredGroupPks);
  const sameAttributes = deepEqual(existing.attributes, attributes);

  if (sameName && samePath && sameGroups && sameAttributes) {
    logger.info(`User "${login}" already up-to-date (pk=${existing.pk})`);
    return { login, action: "noop", pk: existing.pk };
  }

  const changes: string[] = [];
  if (!sameName) changes.push(`name: "${existing.name}" → "${desiredName}"`);
  if (!samePath) changes.push(`path: "${existing.path}" → "${FORGE_ID_SOURCE_PATH}"`);
  if (!sameGroups) {
    const addedOnly = desiredGroupPks.filter((pk) => !existing.groups.includes(pk));
    const removedOnly = existing.groups.filter((pk) => !desiredGroupPks.includes(pk));
    const parts: string[] = [];
    if (addedOnly.length > 0) parts.push(`+[${addedOnly.join(", ")}]`);
    if (removedOnly.length > 0) parts.push(`-[${removedOnly.join(", ")}]`);
    changes.push(`groups: ${parts.join(", ")}`);
  }
  if (!sameAttributes) changes.push("attributes updated");

  if (!options.apply) {
    logger.dry(`Would UPDATE user "${login}" (pk=${existing.pk}): ${changes.join("; ")}`);
    return { login, action: "update", pk: existing.pk };
  }

  const patch: {
    name?: string;
    path: string;
    groups: string[];
    attributes: Record<string, unknown>;
    is_active: boolean;
  } = {
    path: FORGE_ID_SOURCE_PATH,
    groups: desiredGroupPks,
    attributes,
    is_active: true,
  };
  // only include name in the PATCH when display_name was explicitly provided
  if (hasDisplayName) {
    patch.name = desiredName;
  }

  const updated = await client.updateUser(existing.pk, patch);
  logger.success(
    `Updated user "${login}" (pk=${updated.pk}): ${changes.join("; ")}`,
  );
  return { login, action: "update", pk: updated.pk };
}