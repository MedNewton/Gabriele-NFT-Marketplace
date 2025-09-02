import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getByWalletAddress = query({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").filter((q) => q.eq(q.field("wallet"), args.walletAddress)).first();
  },
});

export const getUrl = query({
  args: { id: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    symbol: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      name: args.name,
      symbol: args.symbol,
      description: args.description,
    });
  },
});

export const getById = query({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.string(),
    symbol: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      name: args.name,
      symbol: args.symbol,
      description: args.description,
    });
  },
});