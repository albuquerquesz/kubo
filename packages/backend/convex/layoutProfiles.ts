import { ConvexError, v } from "convex/values";

import { parseLayoutProfile } from "../shared/layout-profile";
import { mutation, query, type QueryCtx } from "./_generated/server";

async function getOwner(ctx: QueryCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.tokenIdentifier ?? null;
}

async function findProfile(ctx: QueryCtx, owner: string) {
  return ctx.db
    .query("layoutProfiles")
    .withIndex("by_owner", (q) => q.eq("ownerTokenIdentifier", owner))
    .unique();
}

/** The signed-in user's saved layout, or null (also null when signed out). */
export const getMine = query({
  args: {},
  returns: v.union(v.object({ layout: v.any(), updatedAt: v.number() }), v.null()),
  handler: async (ctx) => {
    const owner = await getOwner(ctx);
    if (!owner) return null;
    const profile = await findProfile(ctx, owner);
    return profile ? { layout: profile.layout, updatedAt: profile.updatedAt } : null;
  },
});

/** Validates the layout with the shared contract and stores it as the user's profile. */
export const saveMine = mutation({
  args: { layout: v.any() },
  returns: v.object({ updatedAt: v.number() }),
  handler: async (ctx, args) => {
    const owner = await getOwner(ctx);
    if (!owner) throw new ConvexError({ code: "unauthenticated", message: "Sign in to save a layout" });

    const parsed = parseLayoutProfile(args.layout);
    if (!parsed.ok) throw new ConvexError({ code: "invalid_layout", message: parsed.message });

    const updatedAt = Date.now();
    const existing = await findProfile(ctx, owner);
    if (existing) {
      await ctx.db.patch("layoutProfiles", existing._id, { layout: parsed.layout, updatedAt });
    } else {
      await ctx.db.insert("layoutProfiles", {
        ownerTokenIdentifier: owner,
        layout: parsed.layout,
        updatedAt,
      });
    }
    return { updatedAt };
  },
});

/** Deletes the signed-in user's layout profile, if any. */
export const deleteMine = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const owner = await getOwner(ctx);
    if (!owner) throw new ConvexError({ code: "unauthenticated", message: "Sign in first" });
    const existing = await findProfile(ctx, owner);
    if (existing) await ctx.db.delete("layoutProfiles", existing._id);
    return null;
  },
});
