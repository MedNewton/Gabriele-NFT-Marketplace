// convex/collections.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("collections").collect();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    symbol: v.string(),
    description: v.string(),
    imageId: v.optional(v.id("_storage")),
    creator: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("collections", {
      name: args.name,
      symbol: args.symbol,
      description: args.description,
      imageId: args.imageId ?? null,
      creator: args.creator,
    });
  },
});

export const getById = query({
  args: { id: v.id("collections") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("collections"),
    name: v.string(),
    symbol: v.string(),
    description: v.string(),
    imageId: v.optional(v.id("_storage")),
    creator: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      name: args.name,
      symbol: args.symbol,
      description: args.description,
      imageId: args.imageId ?? null,
      creator: args.creator,
    });
  },
});

// Optional: get a short-lived URL to render the file later
export const getImageUrl = query({
  args: { imageId: v.id("_storage") },
  handler: async (ctx, { imageId }) => {
    return await ctx.storage.getUrl(imageId); // string | null
  },
});
