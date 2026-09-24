import { Client, GatewayIntentBits, type Guild, type GuildMember } from "discord.js";
import pg from "pg";

// ---------- args ----------
const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const cli = (name: string): string | undefined => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

// ---------- env ----------
const required = [
  "DISCORD_BOT_TOKEN",
  "GUILD_ID",
  "WEBSITE_URL",
  "API_KEY",
  "DB_URL",
] as const;
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}
const GUILD_ID = cli("--guild-id") ?? process.env.GUILD_ID!;
const WEBSITE_URL = (cli("--website-url") ?? process.env.WEBSITE_URL!).replace(/\/$/, "");
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const API_KEY = process.env.API_KEY!;

// ---------- types ----------
type SiteUser = { login: string; roles: string[] };
type ApiResponse = { user: SiteUser };
type Diff = { toAdd: string[]; toRemove: string[] };
type MemberDiff = {
  discordId: string;
  tag: string;
  login?: string;
  diff: Diff;
};

// ---------- main ----------
const main = async () => {
  const client = new Client({
    intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
  });

  await new Promise<void>((res, rej) => {
    client.once("clientReady", () => res());
    client.once("error", rej);
    client.login(BOT_TOKEN);
  });

  const guild: Guild | null = await client.guilds
    .fetch(GUILD_ID)
    .catch(() => null);
  if (!guild) {
    console.error(`Guild ${GUILD_ID} not found`);
    client.destroy();
    process.exit(1);
  }

  const pgClient = new pg.Client({ connectionString: process.env.DB_URL! });
  await pgClient.connect();
  const { rows: mappings } = await pgClient.query<{
    discord_role_id: string;
    website_role_id: string;
  }>(
    "SELECT discord_role_id, website_role_id FROM discord_role_mappings WHERE guild_id = $1",
    [guild.id],
  );
  await pgClient.end();

  const allManaged = new Set(mappings.map((m) => m.discord_role_id));

  const allMembers = (await guild.members.fetch()).filter((m) => !m.user.bot);

  const differences: MemberDiff[] = [];
  let inSync = 0;
  let errored = 0;

  for (const [discordId, member] of allMembers) {
    const tag = member.user.tag;

    let userRoles: string[] | null = null;
    let websiteLogin: string | undefined;
    let apiError: string | null = null;
    try {
      const res = await fetch(`${WEBSITE_URL}/api/discord/${discordId}`, {
        headers: { "x-api-key": API_KEY },
      });
      if (res.status === 404) {
        userRoles = null;
      } else if (res.ok) {
        const data = (await res.json()) as ApiResponse;
        userRoles = data.user.roles;
        websiteLogin = data.user.login;
      } else {
        apiError = `HTTP ${res.status}`;
      }
    } catch (err) {
      apiError = err instanceof Error ? err.message : String(err);
    }

    if (apiError) {
      errored++;
      if (verbose) console.error(`[ERROR] ${tag} (${discordId}) — ${apiError}`);
      continue;
    }

    if (userRoles === null) {
      // Not linked to a website account — silently skip
      continue;
    }

    const expected = new Set(
      mappings
        .filter((m) => userRoles.includes(m.website_role_id))
        .map((m) => m.discord_role_id),
    );
    const actual = new Set(
      member.roles.cache.filter((r) => allManaged.has(r.id)).map((r) => r.id),
    );
    const toAdd = [...expected].filter((r) => !actual.has(r));
    const toRemove = [...actual].filter((r) => !expected.has(r));

    if (toAdd.length === 0 && toRemove.length === 0) {
      inSync++;
      if (verbose) console.log(`[OK] ${tag} (${discordId})`);
      continue;
    }

    differences.push({ discordId, tag, login: websiteLogin, diff: { toAdd, toRemove } });
  }

  client.destroy();

  // ---------- output ----------
  console.log();
  if (differences.length === 0) {
    console.log("All members in sync.");
  } else {
    console.log(`${differences.length} difference(s) found.\n`);
    for (const d of differences) {
      const label = d.login ?? d.tag;
      console.log(label);
      for (const id of d.diff.toAdd) {
        const r = guild.roles.cache.get(id);
        console.log(`  + ${r?.name ?? id} (${id})`);
      }
      for (const id of d.diff.toRemove) {
        const r = guild.roles.cache.get(id);
        console.log(`  - ${r?.name ?? id} (${id})`);
      }
      console.log();
    }
  }

  if (verbose) {
    console.log(
      `Checked ${allMembers.size} members: ${inSync} in sync, ${differences.length} with diff, ${errored} errored`,
    );
  }

  process.exit(differences.length > 0 ? 1 : 0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
