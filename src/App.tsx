import { Authenticated, Unauthenticated } from "convex/react";
import { lazy, Suspense } from "react";
import { Toaster } from "sonner";
import { LoadingScreen } from "./LoadingScreen";

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
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingScreen />}>
        <Authenticated>
          <BookmarkManager />
        </Authenticated>
        <Unauthenticated>
          <MarketingPage />
        </Unauthenticated>
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
