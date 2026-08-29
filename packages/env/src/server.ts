import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NOTIFIQUE_API_KEY: z.string().min(1),
    NOTIFIQUE_FROM_EMAIL: z.string().min(1),
    NOTIFIQUE_NEWSLETTER_LIST_ID: z.string().trim().min(1),
  },
  runtimeEnv: {
    NOTIFIQUE_API_KEY: process.env.NOTIFIQUE_API_KEY,
    NOTIFIQUE_FROM_EMAIL: process.env.NOTIFIQUE_FROM_EMAIL,
    NOTIFIQUE_NEWSLETTER_LIST_ID: process.env.NOTIFIQUE_NEWSLETTER_LIST_ID,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === "test",
  emptyStringAsUndefined: true,
});
