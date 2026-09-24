import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@/db";

async function runMigrations() {
  console.log("[Migrations] Starting database migrations...");

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("[Migrations] All migrations applied successfully.");
  } catch (error) {
    console.error("[Migrations] Failed to apply migrations:", error);
    process.exit(1);
  }
}

runMigrations();