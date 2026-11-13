import { ConvexError, v } from "convex/values";

import {
  encodeLayoutCode,
  formatLayoutCode,
  hashLayoutCode,
  isLayoutCodeStale,
  LAYOUT_CODE_CLEANUP_BATCH,
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
    if (!doc) return null;

    const now = Date.now();
    if (isLayoutCodeStale(doc, now)) {
      if (doc.usedAt === undefined) await ctx.db.delete("layoutCodes", doc._id);
      return null;
    }

    await ctx.db.patch("layoutCodes", doc._id, { usedAt: now });
    return { layout: doc.layout };
  },
});

/**
 * Deletes codes that can no longer be redeemed (expired or already used). Runs from the cron in
 * `crons.ts`; a full batch reschedules itself so a backlog drains without one huge transaction.
 */
export const deleteStale = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("layoutCodes")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", now))
      .take(LAYOUT_CODE_CLEANUP_BATCH);
    // `undefined` sorts before every number, so this range only matches used codes.
    const used = await ctx.db
      .query("layoutCodes")
      .withIndex("by_used_at", (q) => q.gte("usedAt", 0))
      .take(LAYOUT_CODE_CLEANUP_BATCH);

    const stale = new Map([...expired, ...used].map((doc) => [doc._id, doc]));
    for (const doc of stale.values()) {
      if (isLayoutCodeStale(doc, now)) await ctx.db.delete("layoutCodes", doc._id);
    }

    if (expired.length === LAYOUT_CODE_CLEANUP_BATCH || used.length === LAYOUT_CODE_CLEANUP_BATCH) {
      await ctx.scheduler.runAfter(0, internal.layoutCodes.deleteStale, {});
    }
    return null;
  },
});
