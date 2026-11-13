import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * One layout profile per account (MVP). `layout` is a `LayoutConfig` validated by the
 * shared `@kubojs/types` contract in `layoutProfiles.saveMine` before it is stored.
 */
export const layoutProfiles = defineTable({
  /** `identity.tokenIdentifier` of the owner; always derived from the session. */
  ownerTokenIdentifier: v.string(),
  layout: v.any(),
  updatedAt: v.number(),
}).index("by_owner", ["ownerTokenIdentifier"]);
