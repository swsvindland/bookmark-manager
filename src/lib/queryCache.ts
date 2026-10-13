import { useEffect, useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { FunctionReference, FunctionReturnType, OptionalRestArgs } from "convex/server";
import { convexToJson, jsonToConvex, Value } from "convex/values";

const PREFIX = "queryCache:";

function readCache(key: string) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? undefined : jsonToConvex(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

function writeCache(key: string, value: Value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(convexToJson(value)));
  } catch {
    // Storage full or unavailable; the cache is only a head start
  }
}

// Cached results belong to whoever was signed in, so drop them once nobody is
export function clearQueryCache() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage unavailable, so nothing was cached
  }
}

// The live query result, falling back to the last one saved under `cacheKey`. On page load that
// lets the view render straight away instead of after the auth handshake (refresh the token,
// reconnect, re-run the queries), which is several round trips to Convex
export function useCachedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: Query["_args"],
  cacheKey: string | null,
) {
  const { isAuthenticated } = useConvexAuth();
  const result = useQuery(query, ...([args] as OptionalRestArgs<Query>));
  // Queries can run before the session is restored and answer as a signed-out user (empty
  // lists), so only trust results once signed in
  const live: FunctionReturnType<Query> | undefined = isAuthenticated ? result : undefined;
  const cached = useMemo(
    () => (cacheKey ? (readCache(cacheKey) as FunctionReturnType<Query> | undefined) : undefined),
    [cacheKey],
  );

  useEffect(() => {
    if (cacheKey && live !== undefined) writeCache(cacheKey, live);
  }, [cacheKey, live]);

  return { data: live ?? cached, isLive: live !== undefined };
}
