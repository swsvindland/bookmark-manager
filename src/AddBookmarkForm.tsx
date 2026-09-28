import { useState } from "react";
import { useAction } from "convex/react";
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

interface AddBookmarkFormProps {
  profileId: Id<"profiles">;
  folderId?: Id<"folders">;
  onClose: () => void;
}

export function AddBookmarkForm({ profileId, folderId, onClose }: AddBookmarkFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const addBookmark = useAction(api.bookmarks.add);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }
    // Browsers are lenient here (Chrome accepts "https://not a url"), so also check the hostname
    const hostname = URL.parse(formattedUrl)?.hostname;
    if (!hostname || !/^[a-z0-9._-]+$/i.test(hostname)) {
      setError("That doesn't look like a valid URL.");
      return;
    }

    setIsLoading(true);
    try {
      await addBookmark({
        url: formattedUrl,
        profileId,
        ...(folderId ? { folderId } : {}),
      });

      setUrl("");
      onClose();
    } catch (error) {
      console.error("Failed to add bookmark:", error);
      setError("Failed to add bookmark. Please check the URL and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{folderId ? "Add Bookmark to Folder" : "Add New Bookmark"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            {/* Plain text rather than type="url", which rejects bare domains like example.com */}
            <Input
              id="url"
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://example.com or example.com"
              required
              disabled={isLoading}
              aria-invalid={error !== null}
              aria-describedby="url-hint"
            />
            <p
              id="url-hint"
              className={error ? "text-destructive text-xs" : "text-muted-foreground text-xs"}
            >
              {error ?? "We'll automatically fetch the title, description, and favicon"}
            </p>
          </div>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Adding..." : "Add Bookmark"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
