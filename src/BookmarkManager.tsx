import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { SignOutButton } from './SignOutButton';
import { ProfileSelector } from './ProfileSelector';
import { BookmarkGrid } from './BookmarkGrid';
import { AddBookmarkForm } from './AddBookmarkForm';
import { Id } from '../convex/_generated/dataModel';

import { Button } from '@/components/ui/button';

export function BookmarkManager() {
    const profiles = useQuery(api.profiles.list) || [];
    const defaultProfile = useQuery(api.profiles.getDefault);
    const [selectedProfileId, setSelectedProfileId] = useState<Id<'profiles'> | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const ensureDefaultProfile = useMutation(api.profiles.ensureDefaultProfile);

    // Initialize user with default profile if needed
    useEffect(() => {
        if (!isInitialized && profiles !== undefined) {
            const initializeUser = async () => {
                try {
                    await ensureDefaultProfile();
                    setIsInitialized(true);
                } catch (error) {
                    console.error('Failed to initialize user:', error);
                    setIsInitialized(true); // Set to true anyway to prevent infinite loop
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

    const selectedProfile = profiles.find((p) => p._id === selectedProfileId);

    // Show loading state while initializing
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
            <header className="sticky top-0 z-10 border-b shadow-sm">
                <div className="mx-auto max-w-7xl px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <h1 className="text-2xl font-bold">Bookmarks</h1>
                            <ProfileSelector
                                profiles={profiles}
                                selectedProfileId={selectedProfileId}
                                onProfileSelect={setSelectedProfileId}
                            />
                        </div>
                        <div className="flex items-center gap-4">
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
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedProfile.color }} />
                            <h2 className="text-xl font-semibold">{selectedProfile.name}</h2>
                            <span className="text-muted-foreground text-sm">
                                {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                )}

                {selectedProfileId ? (
                    <BookmarkGrid bookmarks={bookmarks} />
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">Select a profile to view bookmarks</p>
                    </div>
                )}
            </main>

            {showAddForm && selectedProfileId && (
                <AddBookmarkForm profileId={selectedProfileId} onClose={() => setShowAddForm(false)} />
            )}
        </div>
    );
}
