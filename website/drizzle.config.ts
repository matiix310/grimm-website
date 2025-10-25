import { defineConfig } from "drizzle-kit";

if (process.env.DB_URL === undefined)
  throw new Error("Environement variable DB_URL is not defined!");

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/*",
  dbCredentials: {
    url: process.env.DB_URL,
  },
});
