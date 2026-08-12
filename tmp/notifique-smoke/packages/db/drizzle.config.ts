import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
  path: "../../apps/server/.env",
});

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  // libsql/sqlite local + Turso remote both use the turso dialect in drizzle-kit
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
