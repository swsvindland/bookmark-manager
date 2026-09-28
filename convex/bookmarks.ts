import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { extractMetadata } from "./lib/metadata";

export const list = query({
  args: {
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify the profile belongs to the user
    const profile = await ctx.db.get(args.profileId);
    if (!profile || profile.userId !== userId) {
      return [];
    }

    return await ctx.db
      .query("bookmarks")
      .withIndex("by_profile_added", (q) => q.eq("profileId", args.profileId))
      .order("desc")
      .collect();
  },
});

export const add = action({
  args: {
    url: v.string(),
    profileId: v.id("profiles"),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args): Promise<Id<"bookmarks">> => {
    // Fetch metadata for the URL
    let title = args.url;
    let description = "";
    let favicon = "";

    try {
      const response = await fetch(args.url);
      const html = await response.text();

      // Resolve relative favicon links against the final URL, after any redirects
      const metadata = extractMetadata(html, response.url || args.url);
      title = metadata.title || title;
      description = metadata.description;
      favicon = metadata.favicon;
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
      // Use URL as title if metadata fetch fails
    }

    return await ctx.runMutation(api.bookmarks.create, {
      url: args.url,
      title,
      description,
      favicon,
      profileId: args.profileId,
      folderId: args.folderId,
    });
  },
});

export const create = mutation({
  args: {
    url: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    favicon: v.optional(v.string()),
    profileId: v.id("profiles"),
    folderId: v.optional(v.id("folders")),
    // Set when undoing a delete, so the bookmark returns to its original position
    addedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify the profile belongs to the user
    const profile = await ctx.db.get(args.profileId);
    if (!profile || profile.userId !== userId) {
      throw new Error("Profile not found");
    }

    return await ctx.db.insert("bookmarks", {
      url: args.url,
      title: args.title,
      description: args.description,
      favicon: args.favicon,
      profileId: args.profileId,
      userId,
      addedAt: args.addedAt ?? Date.now(),
      folderId: args.folderId,
    });
  },
});

export const remove = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("Bookmark not found");
    }

    await ctx.db.delete(args.bookmarkId);
  },
});

export const update = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    folderId: v.optional(v.union(v.id("folders"), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("Bookmark not found");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    // An empty description removes the field (patching a field to undefined deletes it)
    if (args.description !== undefined) updates.description = args.description || undefined;
    if (args.folderId !== undefined) updates.folderId = args.folderId;

    await ctx.db.patch(args.bookmarkId, updates);
  },
});
