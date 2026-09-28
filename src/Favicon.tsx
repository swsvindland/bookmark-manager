import { useState } from "react";
import { cn } from "@/lib/utils";
import { getDisplayTitle, getFaviconUrl } from "@/lib/bookmarks";

interface FaviconProps {
  bookmark: { url: string; title: string; favicon?: string };
  className?: string;
}

// Site icon, falling back to the title's first letter when there is none or it fails to load
export function Favicon({ bookmark, className }: FaviconProps) {
  const src = getFaviconUrl(bookmark);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <span
        className={cn(
          "bg-primary/10 text-primary flex items-center justify-center rounded-sm font-medium",
          className,
        )}
      >
        {getDisplayTitle(bookmark).charAt(0).toUpperCase()}
      </span>
    );
  }

  // Light backing in dark mode, otherwise dark icons (GitHub, Notion, ...) vanish
  return (
    <img
      src={src}
      alt=""
      className={cn("dark:bg-foreground rounded-sm", className)}
      onError={() => setFailedSrc(src)}
    />
  );
}
