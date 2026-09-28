import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Folder, MoreVertical, Pencil, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { Favicon } from "./Favicon";

interface Bookmark {
  _id: Id<"bookmarks">;
  url: string;
  title: string;
  favicon?: string;
}

interface FolderCardProps {
  folderId: Id<"folders">;
  name: string;
  bookmarks: Bookmark[];
  onOpen: () => void;
}

export function FolderCard({ folderId, name, bookmarks, onOpen }: FolderCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const renameFolder = useMutation(api.folders.rename);
  const removeFolder = useMutation(api.folders.remove);

  const startRenaming = () => {
    setNewName(name);
    setIsRenaming(true);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await renameFolder({ folderId, name: newName.trim() });
      setIsRenaming(false);
    } catch (error) {
      console.error("Failed to rename folder:", error);
      toast.error("Couldn't rename the folder");
    }
  };

  const handleDelete = async () => {
    try {
      await removeFolder({ folderId });
    } catch (error) {
      console.error("Failed to delete folder:", error);
      toast.error("Couldn't delete the folder");
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Card className="card-psycho group hover:ring-primary/50 relative h-full overflow-hidden transition-all duration-200 hover:shadow-md">
            {isRenaming ? (
              <form onSubmit={handleRename} className="flex items-center gap-2 p-4">
                <Input
                  autoFocus
                  aria-label="Folder name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setIsRenaming(false)}
                  className="h-7 text-sm"
                />
                <Button type="submit" size="sm" className="h-7 px-2 text-xs">
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  aria-label="Cancel rename"
                  onClick={() => setIsRenaming(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </form>
            ) : (
              <button
                type="button"
                onClick={onOpen}
                className="flex h-full w-full items-start gap-3 p-4 text-left"
              >
                <FolderPreview bookmarks={bookmarks} />
                <div className="min-w-0 flex-1 pointer-coarse:pr-8">
                  <h3 className="truncate text-sm leading-tight font-semibold tracking-normal normal-case">
                    {name}
                  </h3>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                    <Folder className="h-3 w-3" />
                    {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </button>
            )}

            {/* Quick actions */}
            {!isRenaming && (
              <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 has-[[data-state=open]]:opacity-100 pointer-coarse:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Folder actions"
                      className="bg-background/80 h-8 w-8 border shadow-sm backdrop-blur-sm"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={startRenaming}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Rename</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsConfirmingDelete(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete folder</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={startRenaming}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Rename</span>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => setIsConfirmingDelete(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete folder</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ConfirmDialog
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        title={`Delete "${name}"?`}
        description="The bookmarks inside won't be deleted. They'll move back to the top level."
        confirmLabel="Delete folder"
        onConfirm={handleDelete}
      />
    </>
  );
}

// A 2×2 mosaic of the first few favicons, so folders show what's inside at a glance
function FolderPreview({ bookmarks }: { bookmarks: Bookmark[] }) {
  if (bookmarks.length === 0) {
    return (
      <div className="bg-muted text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center border">
        <Folder className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="grid h-8 w-8 flex-shrink-0 grid-cols-2 gap-0.5">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-muted flex items-center justify-center overflow-hidden">
          {bookmarks[i] && <Favicon bookmark={bookmarks[i]} className="h-3 w-3 text-[8px]" />}
        </div>
      ))}
    </div>
  );
}
