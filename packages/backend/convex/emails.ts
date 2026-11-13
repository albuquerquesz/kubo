"use node";

import { sendMagicLinkEmail } from "@kubojs/email";
import { v } from "convex/values";

import { internalAction } from "./_generated/server";

export const sendMagicLink = internalAction({
  args: { email: v.string(), url: v.string() },
  handler: async (_ctx, { email, url }) => {
    await sendMagicLinkEmail({ to: email, url });
  },
});
