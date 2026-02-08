import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface Profile {
  _id: Id<"profiles">;
  name: string;
  color: string;
  isDefault: boolean;
}

interface ProfileSelectorProps {
  profiles: Profile[];
  selectedProfileId: Id<"profiles"> | null;
  onProfileSelect: (profileId: Id<"profiles">) => void;
}

const PROFILE_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
];

export function ProfileSelector({ profiles, selectedProfileId, onProfileSelect }: ProfileSelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  const createProfile = useMutation(api.profiles.create);
  const setDefaultProfile = useMutation(api.profiles.setDefault);
  const removeProfile = useMutation(api.profiles.remove);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    try {
      const profileId = await createProfile({
        name: newProfileName.trim(),
        color: selectedColor,
        isDefault: profiles.length === 0, // First profile is default
      });
      onProfileSelect(profileId);
      setNewProfileName("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create profile:", error);
    }
  };

  const handleSetDefault = async (profileId: Id<"profiles">) => {
    try {
      await setDefaultProfile({ profileId });
    } catch (error) {
      console.error("Failed to set default profile:", error);
    }
  };

  const handleRemoveProfile = async (profileId: Id<"profiles">) => {
    if (profiles.length <= 1) {
      alert("Cannot delete the last profile");
      return;
    }
    
    if (confirm("Are you sure? This will delete all bookmarks in this profile.")) {
      try {
        await removeProfile({ profileId });
        if (selectedProfileId === profileId) {
          const remainingProfile = profiles.find(p => p._id !== profileId);
          if (remainingProfile) {
            onProfileSelect(remainingProfile._id);
          }
        }
      } catch (error) {
        console.error("Failed to remove profile:", error);
      }
    }
  };

  if (profiles.length === 0 && !showCreateForm) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-gray-500 dark:text-gray-400">No profiles yet</span>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Create Profile
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Profile Tabs */}
        <div className="flex gap-1">
          {profiles.map((profile) => (
            <button
              key={profile._id}
              onClick={() => onProfileSelect(profile._id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedProfileId === profile._id
                  ? "bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: profile.color }}
              />
              {profile.name}
              {profile.isDefault && (
                <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-1 rounded">default</span>
              )}
            </button>
          ))}
        </div>

        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Create New Profile
                </button>
                {selectedProfileId && (
                  <>
                    <button
                      onClick={() => {
                        handleSetDefault(selectedProfileId);
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Set as Default
                    </button>
                    <button
                      onClick={() => {
                        handleRemoveProfile(selectedProfileId);
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Delete Profile
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Profile Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Create New Profile</h3>
            <form onSubmit={handleCreateProfile}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Work, Personal, Gaming"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {PROFILE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color ? "border-gray-400 dark:border-gray-500" : "border-gray-200 dark:border-gray-600"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Profile
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
