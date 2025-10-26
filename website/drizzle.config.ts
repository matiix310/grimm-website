import { defineConfig } from "drizzle-kit";

if (process.env.DEV_DB_URL === undefined)
  throw new Error("Environement variable DEV_DB_URL is not defined!");

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/*",
  dbCredentials: {
    url: process.env.DEV_DB_URL,
  },
});
