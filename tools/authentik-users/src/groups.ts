import type { AuthentikClient } from "./authentik";
import { logger } from "./logger";

/**
 * Build a map `groupName → groupPk` for all names referenced in the input.
 * Throws if any group cannot be found in authentik.
 */
export async function resolveGroupIds(
  client: AuthentikClient,
  groupNames: string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(groupNames)];
  const map = new Map<string, string>();

  for (const name of unique) {
    const group = await client.findGroupByName(name);
    if (!group) {
      throw new Error(`Group not found in authentik: "${name}"`);
    }
    map.set(name, group.pk);
    logger.info(`Group "${name}" → ${group.pk}`);
  }

  return map;
}