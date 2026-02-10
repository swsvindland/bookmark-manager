import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { EditBookmarkModal } from "./EditBookmarkModal";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  Card,
} from "@/components/ui/card";
import { Pencil, Copy, Trash2, MoreVertical, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Bookmark {
  _id: Id<"bookmarks">;
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  addedAt: number;
}

interface BookmarkGridProps {
  bookmarks: Bookmark[];
}

export function BookmarkGrid({ bookmarks }: BookmarkGridProps) {
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const removeBookmark = useMutation(api.bookmarks.remove);

  const handleRemoveBookmark = async (bookmarkId: Id<"bookmarks">) => {
    if (confirm("Are you sure you want to remove this bookmark?")) {
      try {
        await removeBookmark({ bookmarkId });
      } catch (error) {
        console.error("Failed to remove bookmark:", error);
      }
    }
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
  };

  const getFaviconUrl = (bookmark: Bookmark) => {
    if (bookmark.favicon) {
      return bookmark.favicon;
    }
    try {
      const url = new URL(bookmark.url);
      return `${url.protocol}//${url.host}/favicon.ico`;
    } catch {
      return null;
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">No bookmarks yet</h3>
        <p className="text-muted-foreground">Add your first bookmark to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {bookmarks.map((bookmark) => (
          <ContextMenu key={bookmark._id}>
            <ContextMenuTrigger asChild>
              <Card className="group hover:border-primary/50 transition-all duration-200 overflow-hidden relative h-full">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 h-full"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {getFaviconUrl(bookmark) ? (
                        <img
                          src={getFaviconUrl(bookmark)!}
                          alt=""
                          className="w-6 h-6"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-6 h-6 bg-primary/10 text-primary rounded text-xs flex items-center justify-center font-medium ${getFaviconUrl(bookmark) ? 'hidden' : ''}`}>
                        {bookmark.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2 leading-tight">
                        {bookmark.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getDomain(bookmark.url)}
                      </p>
                    </div>
                  </div>
                  {bookmark.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {bookmark.description}
                    </p>
                  )}
                </a>
                
                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm border shadow-sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditBookmark(bookmark)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(bookmark.url)}>
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Copy URL</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          <span>Open link</span>
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleRemoveBookmark(bookmark._id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              <ContextMenuItem onClick={() => handleEditBookmark(bookmark)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => navigator.clipboard.writeText(bookmark.url)}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy URL</span>
              </ContextMenuItem>
              <ContextMenuItem asChild>
                <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>Open link</span>
                </a>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem 
                onClick={() => handleRemoveBookmark(bookmark._id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>

      {editingBookmark && (
        <EditBookmarkModal
          bookmark={editingBookmark}
          onClose={() => setEditingBookmark(null)}
        />
      )}
    </>
  );
}
