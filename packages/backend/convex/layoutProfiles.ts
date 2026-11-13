import { ConvexError, v } from "convex/values";

import {
  DEFAULT_LAYOUT_PROFILE_NAME,
  getLayoutProfileName,
  isSameLayoutProfileName,
  MAX_LAYOUT_PROFILES,
  parseLayoutProfile,
  parseLayoutProfileName,
} from "../shared/layout-profile";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

async function getOwner(ctx: QueryCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.tokenIdentifier ?? null;
}

async function requireOwner(ctx: QueryCtx): Promise<string> {
  const owner = await getOwner(ctx);
  if (!owner) throw new ConvexError({ code: "unauthenticated", message: "Sign in first" });
  return owner;
}

/** The owner's profiles, most recently updated first. */
async function listProfiles(ctx: QueryCtx, owner: string): Promise<Doc<"layoutProfiles">[]> {
  const profiles = await ctx.db
    .query("layoutProfiles")
    .withIndex("by_owner", (q) => q.eq("ownerTokenIdentifier", owner))
    .take(MAX_LAYOUT_PROFILES + 1);
  return profiles.sort((a, b) => b.updatedAt - a.updatedAt);
}

/** A profile the owner can read or change; another account's id behaves as not found. */
async function getOwnedProfile(
  ctx: QueryCtx,
  owner: string,
  id: Id<"layoutProfiles">,
): Promise<Doc<"layoutProfiles">> {
  const profile = await ctx.db.get("layoutProfiles", id);
  if (!profile || profile.ownerTokenIdentifier !== owner) {
    throw new ConvexError({ code: "not_found", message: "Layout profile not found" });
  }
  return profile;
}

const profileValidator = v.object({
  id: v.id("layoutProfiles"),
  name: v.string(),
  layout: v.any(),
  updatedAt: v.number(),
});

function toProfile(doc: Doc<"layoutProfiles">) {
  return {
    id: doc._id,
    name: getLayoutProfileName(doc),
    layout: doc.layout,
    updatedAt: doc.updatedAt,
  };
}

/** The signed-in user's layout profiles, most recently updated first (empty when signed out). */
export const list = query({
  args: {},
  returns: v.array(profileValidator),
  handler: async (ctx) => {
    const owner = await getOwner(ctx);
    if (!owner) return [];
    return (await listProfiles(ctx, owner)).map(toProfile);
  },
});

/**
 * Validates the layout with the shared contract and stores it: updates `id` when given,
 * otherwise creates a new profile. Names are unique per account (case-insensitive).
 */
export const save = mutation({
  args: { id: v.optional(v.id("layoutProfiles")), name: v.string(), layout: v.any() },
  returns: v.object({ id: v.id("layoutProfiles"), updatedAt: v.number() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const layout = parseLayoutProfile(args.layout);
    if (!layout.ok) throw new ConvexError({ code: "invalid_layout", message: layout.message });
    const name = parseLayoutProfileName(args.name);
    if (!name.ok) throw new ConvexError({ code: "invalid_name", message: name.message });

    const profiles = await listProfiles(ctx, owner);
    const duplicate = profiles.find(
      (profile) =>
        profile._id !== args.id &&
        isSameLayoutProfileName(getLayoutProfileName(profile), name.name),
    );
    if (duplicate) {
      throw new ConvexError({
        code: "duplicate_name",
        message: `A profile named "${name.name}" already exists`,
      });
    }

    const updatedAt = Date.now();
    if (args.id) {
      await getOwnedProfile(ctx, owner, args.id);
      await ctx.db.patch("layoutProfiles", args.id, {
        name: name.name,
        layout: layout.layout,
        updatedAt,
      });
      return { id: args.id, updatedAt };
    }

    if (profiles.length >= MAX_LAYOUT_PROFILES) {
      throw new ConvexError({
        code: "too_many_profiles",
        message: `You can save up to ${MAX_LAYOUT_PROFILES} layout profiles`,
      });
    }
    const id = await ctx.db.insert("layoutProfiles", {
      ownerTokenIdentifier: owner,
      name: name.name,
      layout: layout.layout,
      updatedAt,
    });
    return { id, updatedAt };
  },
});

/** Deletes one of the signed-in user's profiles. */
export const remove = mutation({
  args: { id: v.id("layoutProfiles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    await getOwnedProfile(ctx, owner, args.id);
    await ctx.db.delete("layoutProfiles", args.id);
    return null;
  },
});

// Single-profile API used by the site before multiple profiles. Kept so the deployed site keeps
// working between the Convex deploy and the site deploy; remove once the new site is live.

async function latestProfile(ctx: QueryCtx, owner: string) {
  const [latest] = await listProfiles(ctx, owner);
  return latest ?? null;
}

/** @deprecated Use `list`. Returns the most recently updated profile. */
export const getMine = query({
  args: {},
  returns: v.union(v.object({ layout: v.any(), updatedAt: v.number() }), v.null()),
  handler: async (ctx) => {
    const owner = await getOwner(ctx);
    if (!owner) return null;
    const profile = await latestProfile(ctx, owner);
    return profile ? { layout: profile.layout, updatedAt: profile.updatedAt } : null;
  },
});

/** @deprecated Use `save`. Overwrites the most recently updated profile (or creates one). */
export const saveMine = mutation({
  args: { layout: v.any() },
  returns: v.object({ updatedAt: v.number() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const parsed = parseLayoutProfile(args.layout);
    if (!parsed.ok) throw new ConvexError({ code: "invalid_layout", message: parsed.message });

    const updatedAt = Date.now();
    const existing = await latestProfile(ctx, owner);
    if (existing) {
      await ctx.db.patch("layoutProfiles", existing._id, { layout: parsed.layout, updatedAt });
    } else {
      await insertDefaultProfile(ctx, owner, parsed.layout, updatedAt);
    }
    return { updatedAt };
  },
});

async function insertDefaultProfile(
  ctx: MutationCtx,
  owner: string,
  layout: unknown,
  updatedAt: number,
) {
  await ctx.db.insert("layoutProfiles", {
    ownerTokenIdentifier: owner,
    name: DEFAULT_LAYOUT_PROFILE_NAME,
    layout,
    updatedAt,
  });
}

/** @deprecated Use `remove`. Deletes the most recently updated profile, if any. */
export const deleteMine = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);
    const existing = await latestProfile(ctx, owner);
    if (existing) await ctx.db.delete("layoutProfiles", existing._id);
    return null;
  },
});
