import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "./SignOutButton";
import { ProfileSelector } from "./ProfileSelector";
import { BookmarkGrid } from "./BookmarkGrid";
import { AddBookmarkForm } from "./AddBookmarkForm";
import { Id } from "../convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ChevronRight, FolderPlus, Plus } from "lucide-react";

export function BookmarkManager() {
  // Queries return undefined while loading; keep that distinct from "empty"
  const profiles = useQuery(api.profiles.list);
  const [selectedProfileId, setSelectedProfileId] = useState<Id<"profiles"> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [setupFailed, setSetupFailed] = useState(false);
  // The open folder lives in browser history, so Back (or swipe-back) returns to the top level
  const [folderId, setFolderId] = useState<Id<"folders"> | null>(
    () => window.history.state?.folderId ?? null,
  );

  const ensureDefaultProfile = useMutation(api.profiles.ensureDefaultProfile);
  const createFolder = useMutation(api.folders.create);

  // Only brand-new users (loaded, but zero profiles) need a default profile created
  useEffect(() => {
    if (profiles?.length === 0 && !setupFailed) {
      ensureDefaultProfile().catch((error) => {
        console.error("Failed to initialize user:", error);
        setSetupFailed(true);
      });
    }
  }, [profiles, setupFailed, ensureDefaultProfile]);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => setFolderId(e.state?.folderId ?? null);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const enterFolder = (id: Id<"folders">) => {
    window.history.pushState({ folderId: id }, "");
    setFolderId(id);
  };

  const leaveFolder = () => {
    if (window.history.state?.folderId) window.history.back();
    else setFolderId(null);
  };

  const selectProfile = (id: Id<"profiles">) => {
    leaveFolder();
    setSelectedProfileId(id);
  };

  // Fall back to the default profile (or the first one) until the user picks one, or if the
  // picked profile disappears
  const selectedProfile =
    profiles?.find((p) => p._id === selectedProfileId) ??
    profiles?.find((p) => p.isDefault) ??
    profiles?.[0];
  const profileId = selectedProfile?._id ?? null;

  const bookmarks = useQuery(api.bookmarks.list, profileId ? { profileId } : "skip");
  const folders = useQuery(api.folders.list, profileId ? { profileId } : "skip");
  // Undefined if the folder was deleted or belongs to another profile; shows the top level
  const currentFolder = folderId ? folders?.find((f) => f._id === folderId) : undefined;
  const currentFolderBookmarks = currentFolder
    ? bookmarks?.filter((b) => b.folderId === currentFolder._id)
    : undefined;

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !profileId) return;
    setIsCreatingFolder(true);
    try {
      await createFolder({ name: newFolderName.trim(), profileId });
      setNewFolderName("");
      setShowAddFolder(false);
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Couldn't create the folder");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  if (profiles === undefined || (profiles.length === 0 && !setupFailed)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Setting up your bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4">
          {/* Below lg the profile tabs drop to their own scrollable row; below md the action
              buttons collapse to icons (labels stay available to screen readers) */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 lg:flex-nowrap lg:gap-x-6">
            <h1 className="text-2xl font-bold tracking-widest">Bookmarks</h1>
            <div className="order-last w-full min-w-0 lg:order-none lg:w-auto lg:flex-1">
              <ProfileSelector
                profiles={profiles}
                selectedProfileId={profileId}
                onProfileSelect={selectProfile}
              />
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 md:gap-4">
              {/* Folders don't nest, so only offer this at the top level */}
              {!currentFolder && (
                <Button
                  variant="outline"
                  onClick={() => setShowAddFolder(true)}
                  disabled={!profileId}
                >
                  <FolderPlus className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only">New Folder</span>
                </Button>
              )}
              <Button onClick={() => setShowAddForm(true)} disabled={!profileId}>
                <Plus className="h-4 w-4" />
                <span className="sr-only md:not-sr-only">Add Bookmark</span>
              </Button>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {selectedProfile && (
          <div className="mb-6 flex min-w-0 items-center gap-3">
            {currentFolder && (
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2 h-8 w-8 flex-shrink-0"
                onClick={leaveFolder}
                aria-label="Back to all bookmarks"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div
              className="h-3 w-3 flex-shrink-0"
              style={{
                backgroundColor: selectedProfile.color,
                boxShadow: `0 0 8px ${selectedProfile.color}`,
              }}
            />
            {/* The global `*` letter-spacing rule stops children inheriting it, hence the repeats */}
            <h2 className="flex min-w-0 items-center gap-2 text-xl font-semibold tracking-widest">
              {currentFolder ? (
                <>
                  <button
                    type="button"
                    onClick={leaveFolder}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0 tracking-widest uppercase transition-colors"
                  >
                    {selectedProfile.name}
                  </button>
                  <ChevronRight className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                  <span className="truncate tracking-widest">{currentFolder.name}</span>
                </>
              ) : (
                selectedProfile.name
              )}
            </h2>
            {currentFolderBookmarks ? (
              <span className="text-muted-foreground flex-shrink-0 text-sm whitespace-nowrap">
                {currentFolderBookmarks.length} bookmark
                {currentFolderBookmarks.length !== 1 ? "s" : ""}
              </span>
            ) : (
              bookmarks &&
              folders && (
                <span className="text-muted-foreground flex-shrink-0 text-sm whitespace-nowrap">
                  {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
                  {folders.length > 0 &&
                    `, ${folders.length} folder${folders.length !== 1 ? "s" : ""}`}
                </span>
              )
            )}
          </div>
        )}

        {!profileId ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Select a profile to view bookmarks</p>
          </div>
        ) : bookmarks === undefined || folders === undefined ? (
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            aria-busy="true"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="bg-card ring-foreground/10 h-32 animate-pulse rounded-md ring-1"
              />
            ))}
          </div>
        ) : (
          <BookmarkGrid
            bookmarks={bookmarks}
            folders={folders}
            profileId={profileId}
            currentFolderId={currentFolder?._id ?? null}
            onOpenFolder={enterFolder}
            onAddBookmark={() => setShowAddForm(true)}
          />
        )}
      </main>

      {showAddForm && profileId && (
        <AddBookmarkForm
          profileId={profileId}
          folderId={currentFolder?._id}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {showAddFolder && (
        <Dialog open={true} onOpenChange={(open) => !open && setShowAddFolder(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Folder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="folder-name">Folder name</Label>
                <Input
                  id="folder-name"
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. My App — Environments"
                  required
                  autoFocus
                  disabled={isCreatingFolder}
                />
              </div>
              <DialogFooter className="gap-2 sm:justify-start">
                <Button
                  type="submit"
                  disabled={isCreatingFolder || !newFolderName.trim()}
                  className="flex-1"
                >
                  {isCreatingFolder ? "Creating..." : "Create Folder"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddFolder(false)}
                  disabled={isCreatingFolder}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
