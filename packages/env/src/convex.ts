import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string().min(32),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    SITE_URL: z.url(),
    /**
     * Extra hosts (comma-separated, e.g. `stg.kubojs.dev`) the auth server answers for besides
     * SITE_URL. Lets one deployment serve local dev and staging.
     */
    AUTH_ALLOWED_HOSTS: z.string().optional(),
  },
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SITE_URL: process.env.SITE_URL,
    AUTH_ALLOWED_HOSTS: process.env.AUTH_ALLOWED_HOSTS,
  },
  emptyStringAsUndefined: true,
});
