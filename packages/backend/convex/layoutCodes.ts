import { ConvexError, v } from "convex/values";

import {
  encodeLayoutCode,
  formatLayoutCode,
  hashLayoutCode,
  LAYOUT_CODE_LENGTH,
  LAYOUT_CODE_TTL_MS,
} from "../shared/layout-code";
import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery } from "./_generated/server";

/**
 * Creates a single-use code for the signed-in user's saved layout. Runs as an action because
 * codes need cryptographic randomness (query/mutation randomness is deterministic).
 */
export const create = action({
  args: {},
  returns: v.object({ code: v.string(), expiresAt: v.number() }),
  handler: async (ctx): Promise<{ code: string; expiresAt: number }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ code: "unauthenticated", message: "Sign in to create a code" });
    }

    const layout: unknown = await ctx.runQuery(internal.layoutCodes.getSavedLayout, {
      owner: identity.tokenIdentifier,
    });
    if (layout === null) {
      throw new ConvexError({ code: "no_profile", message: "Save a layout first" });
    }

    const code = encodeLayoutCode(crypto.getRandomValues(new Uint8Array(LAYOUT_CODE_LENGTH)));
    const expiresAt = Date.now() + LAYOUT_CODE_TTL_MS;
    await ctx.runMutation(internal.layoutCodes.store, {
      owner: identity.tokenIdentifier,
      codeHash: await hashLayoutCode(code),
      layout,
      expiresAt,
    });
    return { code: formatLayoutCode(code), expiresAt };
  },
});

export const getSavedLayout = internalQuery({
  args: { owner: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("layoutProfiles")
      .withIndex("by_owner", (q) => q.eq("ownerTokenIdentifier", args.owner))
      .unique();
    return profile?.layout ?? null;
  },
});

/** Stores a new code and drops the owner's previous ones, so only the latest code works. */
export const store = internalMutation({
  args: { owner: v.string(), codeHash: v.string(), layout: v.any(), expiresAt: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const previous = await ctx.db
      .query("layoutCodes")
      .withIndex("by_owner", (q) => q.eq("ownerTokenIdentifier", args.owner))
      .collect();
    for (const doc of previous) await ctx.db.delete("layoutCodes", doc._id);

    await ctx.db.insert("layoutCodes", {
      codeHash: args.codeHash,
      ownerTokenIdentifier: args.owner,
      layout: args.layout,
      expiresAt: args.expiresAt,
    });
    return null;
  },
});

/**
 * Atomically consumes a code: returns its layout once, then null for reuse, expiry or an
 * unknown code (the caller cannot tell these apart).
 */
export const consume = internalMutation({
  args: { codeHash: v.string() },
  returns: v.union(v.object({ layout: v.any() }), v.null()),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("layoutCodes")
      .withIndex("by_code_hash", (q) => q.eq("codeHash", args.codeHash))
      .unique();
    if (!doc || doc.usedAt !== undefined) return null;

    const now = Date.now();
    if (doc.expiresAt < now) {
      await ctx.db.delete("layoutCodes", doc._id);
      return null;
    }

    await ctx.db.patch("layoutCodes", doc._id, { usedAt: now });
    return { layout: doc.layout };
  },
});
