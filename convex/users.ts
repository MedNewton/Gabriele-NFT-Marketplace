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
    return ctx
      .db
      .query("users")
      .filter((q) => q.eq(q.field("wallet"), walletAddress))
      .first();
  },
});

// Ensure user exists for wallet (idempotent)
export const ensureByWallet = mutation({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    const existing = await ctx
      .db
      .query("users")
      .filter((q) => q.eq(q.field("wallet"), walletAddress))
      .first();

    if (existing) {
      return { id: existing._id, created: false, user: existing };
    }

    const id = await ctx.db.insert("users", {
      wallet: walletAddress,
      name: "New User",
      dob: "", // adjust default if you prefer
      pp: "kg21jbv9f8fkwrw2h0883wqyfx7ptmfv",
      preferences: [{ theme: "dark" }],
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
