import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { SignOutButton } from './SignOutButton';
import { ProfileSelector } from './ProfileSelector';
import { BookmarkGrid } from './BookmarkGrid';
import { AddBookmarkForm } from './AddBookmarkForm';
import { Id } from '../convex/_generated/dataModel';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderPlus } from 'lucide-react';

export function BookmarkManager() {
    const profiles = useQuery(api.profiles.list) || [];
    const defaultProfile = useQuery(api.profiles.getDefault);
    const [selectedProfileId, setSelectedProfileId] = useState<Id<'profiles'> | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAddFolder, setShowAddFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const ensureDefaultProfile = useMutation(api.profiles.ensureDefaultProfile);
    const createFolder = useMutation(api.folders.create);

    // Initialize user with default profile if needed
    useEffect(() => {
        if (!isInitialized && profiles !== undefined) {
            const initializeUser = async () => {
                try {
                    await ensureDefaultProfile();
                    setIsInitialized(true);
                } catch (error) {
                    console.error('Failed to initialize user:', error);
                    setIsInitialized(true);
                }
            };

            if (profiles.length === 0) {
                initializeUser();
            } else {
                setIsInitialized(true);
            }
        }
    }, [profiles, isInitialized, ensureDefaultProfile]);

    // Set default profile when it loads
    useEffect(() => {
        if (defaultProfile && !selectedProfileId && isInitialized) {
            setSelectedProfileId(defaultProfile._id);
        }
    }, [defaultProfile, selectedProfileId, isInitialized]);

    const bookmarks = useQuery(api.bookmarks.list, selectedProfileId ? { profileId: selectedProfileId } : 'skip') || [];
    const folders = useQuery(api.folders.list, selectedProfileId ? { profileId: selectedProfileId } : 'skip') || [];

    const selectedProfile = profiles.find((p) => p._id === selectedProfileId);

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim() || !selectedProfileId) return;
        setIsCreatingFolder(true);
        try {
            await createFolder({ name: newFolderName.trim(), profileId: selectedProfileId });
            setNewFolderName('');
            setShowAddFolder(false);
        } catch (error) {
            console.error('Failed to create folder:', error);
        } finally {
            setIsCreatingFolder(false);
        }
    };

    if (!isInitialized) {
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
                <div className="mx-auto max-w-7xl px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <h1 className="text-2xl font-bold tracking-widest">Bookmarks</h1>
                            <ProfileSelector
                                profiles={profiles}
                                selectedProfileId={selectedProfileId}
                                onProfileSelect={setSelectedProfileId}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowAddFolder(true)}
                                disabled={!selectedProfileId}
                            >
                                <FolderPlus className="mr-2 h-4 w-4" />
                                New Folder
                            </Button>
                            <Button onClick={() => setShowAddForm(true)} disabled={!selectedProfileId}>
                                Add Bookmark
                            </Button>
                            <SignOutButton />
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8">
                {selectedProfile && (
                    <div className="mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-3" style={{ backgroundColor: selectedProfile.color, boxShadow: `0 0 8px ${selectedProfile.color}` }} />
                            <h2 className="text-xl font-semibold tracking-widest">{selectedProfile.name}</h2>
                            <span className="text-muted-foreground text-sm">
                                {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
                                {folders.length > 0 && `, ${folders.length} folder${folders.length !== 1 ? 's' : ''}`}
                            </span>
                        </div>
                    </div>
                )}

                {selectedProfileId ? (
                    <BookmarkGrid bookmarks={bookmarks} folders={folders} profileId={selectedProfileId} />
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">Select a profile to view bookmarks</p>
                    </div>
                )}
            </main>

            {showAddForm && selectedProfileId && (
                <AddBookmarkForm profileId={selectedProfileId} onClose={() => setShowAddForm(false)} />
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
                                <Button type="submit" disabled={isCreatingFolder || !newFolderName.trim()} className="flex-1">
                                    {isCreatingFolder ? 'Creating...' : 'Create Folder'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowAddFolder(false)} disabled={isCreatingFolder}>
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
