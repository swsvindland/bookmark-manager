import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Bookmark {
  _id: Id<"bookmarks">;
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  addedAt: number;
}

interface EditBookmarkModalProps {
  bookmark: Bookmark;
  onClose: () => void;
}

export function EditBookmarkModal({ bookmark, onClose }: EditBookmarkModalProps) {
  const [title, setTitle] = useState(bookmark.title);
  const [description, setDescription] = useState(bookmark.description || "");
  const [isLoading, setIsLoading] = useState(false);

  const updateBookmark = useMutation(api.bookmarks.update);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await updateBookmark({
        bookmarkId: bookmark._id,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update bookmark:", error);
      alert("Failed to update bookmark. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
        </DialogHeader>

        {/* URL Display */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-sm font-medium">{getDomain(bookmark.url)}</span>
          </div>
          <p className="text-xs text-muted-foreground break-all">{bookmark.url}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bookmark title"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              disabled={isLoading}
              className="resize-none"
            />
          </div>

          <DialogFooter className="sm:justify-start gap-2">
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="flex-1"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
