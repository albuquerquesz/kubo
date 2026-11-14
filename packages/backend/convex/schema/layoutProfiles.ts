import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Named layout profiles, several per account. `layout` is a `LayoutConfig` validated by the
 * shared `@kubojs/types` contract in `layoutProfiles.save` before it is stored.
 */
export const layoutProfiles = defineTable({
  /** `identity.tokenIdentifier` of the owner; always derived from the session. */
  ownerTokenIdentifier: v.string(),
  /** Absent on profiles saved before names existed; shown as "Meu layout". */
  name: v.optional(v.string()),
  layout: v.any(),
  updatedAt: v.number(),
}).index("by_owner", ["ownerTokenIdentifier"]);
