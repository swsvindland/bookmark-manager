import { useConvexAuth } from "convex/react";
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "sonner";
import { LoadingScreen } from "./LoadingScreen";
import { clearQueryCache } from "@/lib/queryCache";

// Split by route: signed-in users never download the marketing page, and visitors never
// download the bookmark manager (menus, dialogs, icons)
const loadBookmarkManager = () => import("./BookmarkManager");
const BookmarkManager = lazy(() =>
  loadBookmarkManager().then((m) => ({ default: m.BookmarkManager })),
);

// Returning users: download the bookmark manager during the auth handshake, not after it
function hasStoredSession() {
  try {
    return Object.keys(localStorage).some((key) => key.startsWith("__convexAuthRefreshToken_"));
  } catch {
    return false;
  }
}
if (hasStoredSession()) loadBookmarkManager().catch(() => {});
const MarketingPage = lazy(() =>
  import("./MarketingPage").then((m) => ({ default: m.MarketingPage })),
);

export default function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  // Returning users get their bookmarks (from the last visit's cache) while the session is still
  // being restored, rather than a blank page until it is
  const showBookmarks = isAuthenticated || (isLoading && hasStoredSession());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) clearQueryCache();
  }, [isLoading, isAuthenticated]);

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingScreen />}>
        {showBookmarks ? <BookmarkManager /> : !isLoading && <MarketingPage />}
      </Suspense>
      <Toaster
        theme="system"
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
            "--border-radius": "var(--radius)",
            fontFamily: "var(--font-sans)",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
