import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// The given profile if the user owns it; with no profile given, the user's default profile (or
// their first one, matching the client's fallback in BookmarkManager)
export async function resolveProfile(
  ctx: QueryCtx,
  userId: Id<"users">,
  profileId?: Id<"profiles">,
) {
  if (profileId) {
    const profile = await ctx.db.get(profileId);
    return profile && profile.userId === userId ? profile : null;
  }

  const defaultProfile = await ctx.db
    .query("profiles")
    .withIndex("by_user_default", (q) => q.eq("userId", userId).eq("isDefault", true))
    .first();
  if (defaultProfile) return defaultProfile;

  return await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}
