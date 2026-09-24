#!/usr/bin/env bun
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { AuthentikClient } from "./authentik";
import { resolveGroupIds } from "./groups";
import { upsertUser } from "./users";
import { logger } from "./logger";
import type { UsersFile } from "./types";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ────────────────────────── .env loader ──────────────────────────
async function loadDotEnv(path: string): Promise<void> {
  try {
    const file = Bun.file(path);
    const text = await file.text();
    if (!text) return;
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      // system env wins
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  } catch {
    // file missing — fine
  }
}

await loadDotEnv(resolve(__dirname, "..", ".env"));

// ────────────────────────── CLI args ──────────────────────────
function parseArgs(argv: string[]): { file: string; apply: boolean } {
  let file = "users.yaml";
  let apply = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] ?? "";
    if (a === "--apply") apply = true;
    else if (a === "--dry-run") apply = false;
    else if (a === "-h" || a === "--help") {
      printHelp();
      process.exit(0);
    } else if (!a.startsWith("-")) file = a;
  }
  return { file, apply };
}

function printHelp(): void {
  console.log(`authentik-users — create / update authentik users from a YAML file

Usage:
  bun run src/index.ts [file] [--apply] [--dry-run]

Args:
  file           Path to the YAML input file (default: users.yaml)

Options:
  --apply        Actually perform the changes (default: dry-run)
  --dry-run      Show what would happen without touching anything
  -h, --help     Show this help

Environment (read from tools/authentik-users/.env if present):
  AUTHENTIK_URL    Base URL of your authentik instance
  AUTHENTIK_TOKEN  API token with users + groups scopes
`);
}

const args = parseArgs(process.argv.slice(2));

// ────────────────────────── env validation ──────────────────────────
const baseUrl = process.env.AUTHENTIK_URL;
const token = process.env.AUTHENTIK_TOKEN;

if (!baseUrl) {
  logger.error("AUTHENTIK_URL is not set (check .env or environment)");
  process.exit(1);
}
if (!token) {
  logger.error("AUTHENTIK_TOKEN is not set (check .env or environment)");
  process.exit(1);
}

// ────────────────────────── load input file ──────────────────────────
const filePath = resolve(process.cwd(), args.file);
logger.header(`authentik-users — ${args.apply ? "APPLY" : "DRY-RUN"}`);
logger.info(`Input file: ${filePath}`);
logger.info(`Authentik:  ${baseUrl}`);

let inputData: UsersFile;
try {
  const text = await Bun.file(filePath).text();
  inputData = Bun.YAML.parse(text) as UsersFile;
} catch (e) {
  logger.error(`Failed to read or parse YAML file "${filePath}": ${(e as Error).message}`);
  process.exit(1);
}

if (!inputData || !Array.isArray(inputData.users)) {
  logger.error(`Invalid YAML: expected { users: [{ login, groups }] }`);
  process.exit(1);
}

// basic validation
for (const u of inputData.users) {
  if (!u || typeof u.login !== "string" || u.login.length === 0) {
    logger.error(`Invalid entry: missing or empty "login"`);
    process.exit(1);
  }
  if (u.display_name !== undefined && typeof u.display_name !== "string") {
    logger.error(`Invalid entry for "${u.login}": "display_name" must be a string`);
    process.exit(1);
  }
  for (const field of ["added_groups", "removed_groups"] as const) {
    const v = u[field];
    if (v === undefined) continue;
    if (!Array.isArray(v)) {
      logger.error(
        `Invalid entry for "${u.login}": "${field}" must be an array of strings`,
      );
      process.exit(1);
    }
    for (const g of v) {
      if (typeof g !== "string" || g.length === 0) {
        logger.error(
          `Invalid entry for "${u.login}": each entry in "${field}" must be a non-empty string`,
        );
        process.exit(1);
      }
    }
  }
}

logger.info(`Found ${inputData.users.length} user(s) in input`);

const client = new AuthentikClient({ baseUrl, token });

// ────────────────────────── resolve groups ──────────────────────────
const allGroupNames = inputData.users.flatMap((u) => [
  ...(u.added_groups ?? []),
  ...(u.removed_groups ?? []),
]);
let groupPkByName: Map<string, string>;
try {
  groupPkByName = await resolveGroupIds(client, allGroupNames);
} catch (e) {
  logger.error((e as Error).message);
  process.exit(1);
}

// ────────────────────────── upsert users ──────────────────────────
let created = 0;
let updated = 0;
let noop = 0;
let failed = 0;

for (const user of inputData.users) {
  try {
    const result = await upsertUser(client, groupPkByName, user, {
      apply: args.apply,
    });
    if (result.action === "create") created++;
    else if (result.action === "update") updated++;
    else noop++;
  } catch (e) {
    failed++;
    logger.error(`Failed to process "${user.login}": ${(e as Error).message}`);
  }
}

// ────────────────────────── summary ──────────────────────────
logger.header("Summary");
console.log(`  ✅ Created:    ${created}`);
console.log(`  🔄 Updated:    ${updated}`);
console.log(`  ⏭  No change:  ${noop}`);
console.log(`  ❌ Failed:     ${failed}`);

if (failed > 0) process.exit(1);
if (!args.apply) {
  logger.warn("Dry-run mode — no changes were sent to authentik. Re-run with --apply.");
}