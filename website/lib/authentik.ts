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