import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "./SignOutButton";
import { ProfileSelector } from "./ProfileSelector";
import { BookmarkGrid } from "./BookmarkGrid";
import { AddBookmarkForm } from "./AddBookmarkForm";
import { Id } from "../convex/_generated/dataModel";

export function BookmarkManager() {
  const profiles = useQuery(api.profiles.list) || [];
  const defaultProfile = useQuery(api.profiles.getDefault);
  const [selectedProfileId, setSelectedProfileId] = useState<Id<"profiles"> | null>(null);
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
          console.error("Failed to initialize user:", error);
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

  const bookmarks = useQuery(
    api.bookmarks.list,
    selectedProfileId ? { profileId: selectedProfileId } : "skip"
  ) || [];

  const selectedProfile = profiles.find(p => p._id === selectedProfileId);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Setting up your bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bookmarks</h1>
              <ProfileSelector
                profiles={profiles}
                selectedProfileId={selectedProfileId}
                onProfileSelect={setSelectedProfileId}
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddForm(true)}
                disabled={!selectedProfileId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Bookmark
              </button>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {selectedProfile && (
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedProfile.color }}
              />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {selectedProfile.name}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {selectedProfileId ? (
          <BookmarkGrid bookmarks={bookmarks} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Select a profile to view bookmarks</p>
          </div>
        )}
      </main>

      {showAddForm && selectedProfileId && (
        <AddBookmarkForm
          profileId={selectedProfileId}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
