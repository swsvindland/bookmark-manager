import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { EditBookmarkModal } from "./EditBookmarkModal";
import { FolderCard } from "./FolderCard";
import { Favicon } from "./Favicon";
import { getDisplayTitle, getDomain } from "@/lib/bookmarks";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import { Card } from "@/components/ui/card";
import {
  Pencil,
  Copy,
  Trash2,
  MoreVertical,
  ExternalLink,
  FolderInput,
  FolderMinus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

interface Bookmark {
  _id: Id<"bookmarks">;
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  addedAt: number;
  folderId?: Id<"folders">;
}

interface Folder {
  _id: Id<"folders">;
  name: string;
}

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  folders: Folder[];
  profileId: Id<"profiles">;
  // null shows the top level: folders plus bookmarks that aren't in one
  currentFolderId: Id<"folders"> | null;
  onOpenFolder: (folderId: Id<"folders">) => void;
  onAddBookmark: () => void;
}

export function BookmarkGrid({
  bookmarks,
  folders,
  profileId,
  currentFolderId,
  onOpenFolder,
  onAddBookmark,
}: BookmarkGridProps) {
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const createBookmark = useMutation(api.bookmarks.create);
  const removeBookmark = useMutation(api.bookmarks.remove);
  const updateBookmark = useMutation(api.bookmarks.update);

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copied"),
      () => toast.error("Couldn't copy the link"),
    );
  };

  const restoreBookmark = async (bookmark: Bookmark) => {
    try {
      await createBookmark({
        url: bookmark.url,
        title: bookmark.title,
        description: bookmark.description,
        favicon: bookmark.favicon,
        profileId,
        // Skip the folder if it was deleted in the meantime
        folderId: folders.some((f) => f._id === bookmark.folderId) ? bookmark.folderId : undefined,
        addedAt: bookmark.addedAt,
      });
    } catch (error) {
      console.error("Failed to restore bookmark:", error);
      toast.error("Couldn't restore the bookmark");
    }
  };

  // Deletes right away and offers Undo, instead of asking for confirmation first
  const handleRemoveBookmark = async (bookmark: Bookmark) => {
    try {
      await removeBookmark({ bookmarkId: bookmark._id });
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
      toast.error("Couldn't delete the bookmark");
      return;
    }
    toast("Bookmark deleted", {
      action: { label: "Undo", onClick: () => void restoreBookmark(bookmark) },
    });
  };

  const handleMoveToFolder = async (
    bookmarkId: Id<"bookmarks">,
    folderId: Id<"folders"> | null,
  ) => {
    try {
      await updateBookmark({ bookmarkId, folderId: folderId ?? null });
      // The card usually disappears from the current view, so say where it went
      const folderName = folders.find((f) => f._id === folderId)?.name;
      toast.success(folderName ? `Moved to ${folderName}` : "Removed from folder");
    } catch (error) {
      console.error("Failed to move bookmark:", error);
      toast.error("Couldn't move the bookmark");
    }
  };

  const visibleBookmarks = bookmarks.filter((b) =>
    currentFolderId ? b.folderId === currentFolderId : !b.folderId,
  );

  if (!currentFolderId && bookmarks.length === 0 && folders.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-muted-foreground mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold">No bookmarks yet</h3>
        <p className="text-muted-foreground mb-6">Add your first bookmark to get started</p>
        <Button onClick={onAddBookmark}>
          <Plus className="h-4 w-4" />
          Add bookmark
        </Button>
      </div>
    );
  }

  const renderBookmarkCard = (bookmark: Bookmark) => (
    <ContextMenu key={bookmark._id}>
      <ContextMenuTrigger asChild>
        <Card className="card-psycho group hover:ring-primary/50 relative h-full overflow-hidden transition-all duration-200 hover:shadow-md">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full p-4"
          >
            <div className="mb-3 flex items-start gap-3">
              <div className="bg-muted flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-none border">
                <Favicon bookmark={bookmark} className="h-6 w-6 text-xs" />
              </div>
              <div className="min-w-0 flex-1 pointer-coarse:pr-8">
                {/* wrap-anywhere lets long URL-like titles break instead of overflowing */}
                <h3 className="line-clamp-2 text-sm leading-tight font-semibold tracking-normal wrap-anywhere normal-case">
                  {getDisplayTitle(bookmark)}
                </h3>
                <p className="text-muted-foreground mt-1 truncate text-xs">
                  {getDomain(bookmark.url)}
                </p>
              </div>
            </div>
            {bookmark.description && (
              <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                {bookmark.description}
              </p>
            )}
          </a>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 has-[[data-state=open]]:opacity-100 pointer-coarse:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Bookmark actions"
                  className="bg-background/80 h-8 w-8 border shadow-sm backdrop-blur-sm"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditingBookmark(bookmark)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyLink(bookmark.url)}>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Copy URL</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <span>Open link</span>
                  </a>
                </DropdownMenuItem>
                {folders.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <FolderInput className="mr-2 h-4 w-4" />
                        <span>Move to folder</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {folders.map((folder) => (
                          <DropdownMenuItem
                            key={folder._id}
                            onClick={() => handleMoveToFolder(bookmark._id, folder._id)}
                            disabled={bookmark.folderId === folder._id}
                          >
                            {folder.name}
                          </DropdownMenuItem>
                        ))}
                        {bookmark.folderId && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleMoveToFolder(bookmark._id, null)}
                            >
                              <FolderMinus className="mr-2 h-4 w-4" />
                              <span>Remove from folder</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleRemoveBookmark(bookmark)}
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
        <ContextMenuItem onClick={() => setEditingBookmark(bookmark)}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => copyLink(bookmark.url)}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy URL</span>
        </ContextMenuItem>
        <ContextMenuItem asChild>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>Open link</span>
          </a>
        </ContextMenuItem>
        {folders.length > 0 && (
          <>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <FolderInput className="mr-2 h-4 w-4" />
                <span>Move to folder</span>
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {folders.map((folder) => (
                  <ContextMenuItem
                    key={folder._id}
                    onClick={() => handleMoveToFolder(bookmark._id, folder._id)}
                    disabled={bookmark.folderId === folder._id}
                  >
                    {folder.name}
                  </ContextMenuItem>
                ))}
                {bookmark.folderId && (
                  <>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => handleMoveToFolder(bookmark._id, null)}>
                      <FolderMinus className="mr-2 h-4 w-4" />
                      <span>Remove from folder</span>
                    </ContextMenuItem>
                  </>
                )}
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => handleRemoveBookmark(bookmark)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {/* Folders only exist at the top level */}
        {!currentFolderId &&
          folders.map((folder) => (
            <FolderCard
              key={folder._id}
              folderId={folder._id}
              name={folder.name}
              bookmarks={bookmarks.filter((b) => b.folderId === folder._id)}
              onOpen={() => onOpenFolder(folder._id)}
            />
          ))}

        {visibleBookmarks.map((bookmark) => renderBookmarkCard(bookmark))}

        <button
          type="button"
          onClick={onAddBookmark}
          className="text-muted-foreground hover:text-foreground hover:border-primary/50 flex min-h-32 items-center justify-center gap-2 rounded-md border border-dashed text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add bookmark
        </button>
      </div>

      {editingBookmark && (
        <EditBookmarkModal bookmark={editingBookmark} onClose={() => setEditingBookmark(null)} />
      )}
    </>
  );
}
