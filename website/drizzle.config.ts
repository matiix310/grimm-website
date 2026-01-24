import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/*",
  dbCredentials: {
    database: "grimm",
    host: "localhost",
    password: process.env.DB_PASSWORD,
    port: 5432,
    user: "postgres",
    ssl: false,
  },
});
