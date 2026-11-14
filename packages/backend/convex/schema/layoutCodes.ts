import { defineTable } from "convex/server";
import { v } from "convex/values";

/** Short-lived, single-use codes the CLI exchanges for a snapshot of the owner's layout. */
export const layoutCodes = defineTable({
  /** SHA-256 of the normalized code; the code itself is never stored. */
  codeHash: v.string(),
  ownerTokenIdentifier: v.string(),
  /** Snapshot of the saved layout profile when the code was created. */
  layout: v.any(),
  expiresAt: v.number(),
  usedAt: v.optional(v.number()),
})
  .index("by_code_hash", ["codeHash"])
  .index("by_owner", ["ownerTokenIdentifier"])
  .index("by_expires_at", ["expiresAt"])
  .index("by_used_at", ["usedAt"]);
