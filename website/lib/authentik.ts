import { getEnvOrThrow } from "./env";

const API = getEnvOrThrow("AUTHENTIK_BASE_URL");
const TOKEN = getEnvOrThrow("AUTHENTIK_API_TOKEN");

export async function getUserAuthentikGroups(login: string): Promise<string[]> {
  const res = await fetch(
    `${API}/api/v3/core/groups/?members_by_username=${encodeURIComponent(login)}`,
    { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Authentik API error ${res.status}`);
  const data = (await res.json()) as { results: { name: string }[] };
  return data.results.map((g) => g.name);
}

/**
 * Lists every group defined in the configured Authentik instance.
 * Uses the `/api/v3/core/groups/` endpoint and follows pagination.
 * Returns the group names sorted alphabetically.
 */
export async function listAuthentikGroups(): Promise<{ name: string }[]> {
  const PAGE_SIZE = 200;
  const collected: { name: string }[] = [];

  let url: string | null =
    `${API}/api/v3/core/groups/?page_size=${PAGE_SIZE}`;

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Authentik API error ${res.status}`);
    const data = (await res.json()) as {
      results: { name: string }[];
      pagination: { next: number | null };
    };
    collected.push(...data.results);
    if (data.pagination?.next && data.pagination.next > 0) {
      url = `${API}/api/v3/core/groups/?page_size=${PAGE_SIZE}&page=${data.pagination.next}`;
    } else {
      url = null;
    }
  }

  return collected
    .map((g) => ({ name: g.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}