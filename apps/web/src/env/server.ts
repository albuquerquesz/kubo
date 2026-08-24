import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NOTIFIQUE_API_KEY: z.string().min(1),
    NOTIFIQUE_BASE_URL: z.url().default("https://api.notifique.dev"),
    NOTIFIQUE_NEWSLETTER_LIST_ID: z.string().trim().min(1),
  },
  experimental__runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === "test",
  emptyStringAsUndefined: true,
});
