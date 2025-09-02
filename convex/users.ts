import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List all users
export const get = query({
  args: {},
  handler: async (ctx) => ctx.db.query("users").collect(),
});

// Find by wallet
export const getByWalletAddress = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    // Guard: empty/whitespace → no-op
    const addr = walletAddress.trim();
    if (!addr) return null;

    // 1) Try exact match (works if you stored the original casing)
    const exact = await ctx
      .db
      .query("users")
      .filter((q) => q.eq(q.field("wallet"), addr))
      .first();
    if (exact) return exact;

    // 2) Try lowercase match (helps if you store normalized lowercase in DB)
    const lower = addr.toLowerCase();
    if (lower !== addr) {
      const lowerHit = await ctx
        .db
        .query("users")
        .filter((q) => q.eq(q.field("wallet"), lower))
        .first();
      if (lowerHit) return lowerHit;
    }

    return null;
  },
});

// Ensure user exists for wallet (idempotent)
export const ensureByWallet = mutation({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    // Normalize the input
    const raw = walletAddress.trim();
    if (!raw) return { id: null, created: false, user: null };

    const lower = raw.toLowerCase();

    // Try exact (covers any old rows saved with original casing)
    const exact = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("wallet"), raw))
      .first();
    if (exact) return { id: exact._id, created: false, user: exact };

    // Try lowercase (recommended normalized storage)
    const byLower = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("wallet"), lower))
      .first();
    if (byLower) return { id: byLower._id, created: false, user: byLower };

    // Create a new user (omit `pp` unless you have a real storage Id)
    const id = await ctx.db.insert("users", {
      wallet: lower,
      name: "New User",
      dob: "",
      preferences: [{ theme: "dark" }],
      pp: "kg2ayx7p6hcr21w7zt52y5h4c17ptrp5"
    });

    const user = await ctx.db.get(id);
    return { id, created: true, user };
  },
});

// Signed URL for storage id
export const getUrl = query({
  args: { id: v.id("_storage") },
  handler: async (ctx, { id }) => ctx.storage.getUrl(id), // string | null
});

// Create (flexible)
export const create = mutation({
  args: {
    wallet: v.string(),
    name: v.optional(v.string()),
    dob: v.optional(v.string()),
    pp: v.optional(v.id("_storage")),
    preferences: v.optional(v.array(v.object({ theme: v.string() }))),
  },
  handler: async (ctx, args) => {
    const doc: any = {
      wallet: args.wallet,
      name: args.name ?? "Unnamed",
      dob: args.dob ?? "",
      preferences: args.preferences ?? [{ theme: "dark" }],
    };
    if (args.pp !== undefined) doc.pp = args.pp;
    return ctx.db.insert("users", doc);
  },
});

// Get by id
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

// Update (partial; wallet not editable)
export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    dob: v.optional(v.string()),
    pp: v.optional(v.id("_storage")),
    preferences: v.optional(v.array(v.object({ theme: v.string() }))),
  },
  handler: async (ctx, { id, ...rest }) => {
    const patch: any = {};
    if (rest.name !== undefined) patch.name = rest.name;
    if (rest.dob !== undefined) patch.dob = rest.dob;
    if (rest.pp !== undefined) patch.pp = rest.pp;
    if (rest.preferences !== undefined) patch.preferences = rest.preferences;

    await ctx.db.patch(id, patch);
    return ctx.db.get(id);
  },
});
