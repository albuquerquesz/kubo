import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import { z } from "zod";

// Load monorepo package env relative to this file (not process.cwd()).
// Turbo/`bun run` from the workspace root would otherwise miss apps/*/ .env.
const envFilePath = resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "../../../apps/server/.env",
);
config({ path: envFilePath });

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    NOTIFIQUE_API_KEY: z.string().min(1).optional(),
    NOTIFIQUE_BASE_URL: z.url().default("https://api.notifique.dev"),
    NOTIFIQUE_WHATSAPP_INSTANCE_ID: z.string().min(1).optional(),
    NOTIFIQUE_FROM_EMAIL: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
