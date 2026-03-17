import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

export const list = query({
    args: {
        profileId: v.id('profiles'),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const profile = await ctx.db.get(args.profileId);
        if (!profile || profile.userId !== userId) return [];

        return await ctx.db
            .query('folders')
            .withIndex('by_profile', (q) => q.eq('profileId', args.profileId))
            .order('asc')
            .collect();
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        profileId: v.id('profiles'),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error('Not authenticated');

        const profile = await ctx.db.get(args.profileId);
        if (!profile || profile.userId !== userId) throw new Error('Profile not found');

        return await ctx.db.insert('folders', {
            name: args.name,
            profileId: args.profileId,
            userId,
            createdAt: Date.now(),
        });
    },
});

export const rename = mutation({
    args: {
        folderId: v.id('folders'),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error('Not authenticated');

        const folder = await ctx.db.get(args.folderId);
        if (!folder || folder.userId !== userId) throw new Error('Folder not found');

        await ctx.db.patch(args.folderId, { name: args.name });
    },
});

export const remove = mutation({
    args: {
        folderId: v.id('folders'),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error('Not authenticated');

        const folder = await ctx.db.get(args.folderId);
        if (!folder || folder.userId !== userId) throw new Error('Folder not found');

        // Remove folderId from all bookmarks in this folder
        const bookmarks = await ctx.db
            .query('bookmarks')
            .withIndex('by_folder', (q) => q.eq('folderId', args.folderId))
            .collect();

        for (const bookmark of bookmarks) {
            await ctx.db.patch(bookmark._id, { folderId: undefined });
        }

        await ctx.db.delete(args.folderId);
    },
});
