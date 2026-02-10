import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MoreVertical, PlusCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Profile {
    _id: Id<'profiles'>;
    name: string;
    color: string;
    isDefault: boolean;
}

interface ProfileSelectorProps {
    profiles: Profile[];
    selectedProfileId: Id<'profiles'> | null;
    onProfileSelect: (profileId: Id<'profiles'>) => void;
}

const PROFILE_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export function ProfileSelector({ profiles, selectedProfileId, onProfileSelect }: ProfileSelectorProps) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS[0]);

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
            setNewProfileName('');
            setShowCreateForm(false);
        } catch (error) {
            console.error('Failed to create profile:', error);
        }
    };

    const handleSetDefault = async (profileId: Id<'profiles'>) => {
        try {
            await setDefaultProfile({ profileId });
        } catch (error) {
            console.error('Failed to set default profile:', error);
        }
    };

    const handleRemoveProfile = async (profileId: Id<'profiles'>) => {
        if (profiles.length <= 1) {
            alert('Cannot delete the last profile');
            return;
        }

        if (confirm('Are you sure? This will delete all bookmarks in this profile.')) {
            try {
                await removeProfile({ profileId });
                if (selectedProfileId === profileId) {
                    const remainingProfile = profiles.find((p) => p._id !== profileId);
                    if (remainingProfile) {
                        onProfileSelect(remainingProfile._id);
                    }
                }
            } catch (error) {
                console.error('Failed to remove profile:', error);
            }
        }
    };

    if (profiles.length === 0 && !showCreateForm) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-muted-foreground">No profiles yet</span>
                <Button onClick={() => setShowCreateForm(true)} size="sm">
                    Create Profile
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {/* Profile Tabs */}
            <div className="flex max-w-md gap-1 overflow-x-auto pb-1 sm:max-w-xl">
                {profiles.map((profile) => (
                    <Button
                        key={profile._id}
                        variant={selectedProfileId === profile._id ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => onProfileSelect(profile._id)}
                        className={cn(
                            'flex h-9 items-center gap-2 px-3',
                            selectedProfileId === profile._id && 'bg-background border shadow-sm',
                        )}
                    >
                        <div
                            className="h-3 w-3 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: profile.color }}
                        />
                        <span className="max-w-[100px] truncate">{profile.name}</span>
                        {profile.isDefault && (
                            <span className="bg-muted text-muted-foreground rounded px-1 text-[10px] font-bold uppercase">
                                default
                            </span>
                        )}
                    </Button>
                ))}
            </div>

            {/* Dropdown Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowCreateForm(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>Create New Profile</span>
                    </DropdownMenuItem>
                    {selectedProfileId && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSetDefault(selectedProfileId)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                <span>Set as Default</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleRemoveProfile(selectedProfileId)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete Profile</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Profile Form Dialog */}
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="profile-name">Profile Name</Label>
                            <Input
                                id="profile-name"
                                type="text"
                                value={newProfileName}
                                onChange={(e) => setNewProfileName(e.target.value)}
                                placeholder="e.g., Work, Personal, Gaming"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {PROFILE_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        className={cn(
                                            'h-8 w-8 rounded-full border-2 transition-all',
                                            selectedColor === color
                                                ? 'border-primary scale-110 shadow-sm'
                                                : 'border-transparent hover:scale-105',
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="submit" className="flex-1">
                                Create Profile
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreateForm(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
