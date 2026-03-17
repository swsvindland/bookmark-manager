import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { Folder, FolderOpen, MoreVertical, Pencil, Trash2, ExternalLink, Copy, X, Plus } from 'lucide-react';
import { AddBookmarkForm } from './AddBookmarkForm';

interface Bookmark {
    _id: Id<'bookmarks'>;
    url: string;
    title: string;
    description?: string;
    favicon?: string;
    addedAt: number;
    folderId?: Id<'folders'>;
}

interface FolderCardProps {
    folderId: Id<'folders'>;
    name: string;
    bookmarks: Bookmark[];
    profileId: Id<'profiles'>;
    onRemoveBookmark: (bookmarkId: Id<'bookmarks'>) => void;
}

export function FolderCard({ folderId, name, bookmarks, profileId, onRemoveBookmark }: FolderCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(name);
    const [isAddingBookmark, setIsAddingBookmark] = useState(false);

    const renameFolder = useMutation(api.folders.rename);
    const removeFolder = useMutation(api.folders.remove);

    const getFaviconUrl = (bookmark: Bookmark) => {
        if (bookmark.favicon) return bookmark.favicon;
        try {
            const url = new URL(bookmark.url);
            return `${url.protocol}//${url.host}/favicon.ico`;
        } catch {
            return null;
        }
    };

    const getDomain = (url: string) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    };

    const handleRename = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        try {
            await renameFolder({ folderId, name: newName.trim() });
            setIsRenaming(false);
        } catch (error) {
            console.error('Failed to rename folder:', error);
        }
    };

    const handleDelete = async () => {
        if (confirm(`Delete folder "${name}"? Bookmarks inside will be moved out of the folder.`)) {
            try {
                await removeFolder({ folderId });
            } catch (error) {
                console.error('Failed to delete folder:', error);
            }
        }
    };

    const menuItems = (
        <>
            <DropdownMenuItem onClick={() => { setIsRenaming(true); setNewName(name); }}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete folder</span>
            </DropdownMenuItem>
        </>
    );

    const contextMenuItems = (
        <>
            <ContextMenuItem onClick={() => { setIsRenaming(true); setNewName(name); }}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Rename</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete folder</span>
            </ContextMenuItem>
        </>
    );

    return (
        <>
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <Card
                    className={`card-psycho group hover:border-primary/50 relative overflow-hidden transition-all duration-200 hover:shadow-md ${isOpen ? 'col-span-full' : ''}`}
                >
                    {/* Folder header */}
                    <div
                        className="flex cursor-pointer items-center gap-3 p-4"
                        onClick={() => !isRenaming && setIsOpen((o) => !o)}
                    >
                        <div className="text-primary flex-shrink-0">
                            {isOpen ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
                        </div>

                        {isRenaming ? (
                            <form onSubmit={handleRename} className="flex flex-1 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Input
                                    autoFocus
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="h-7 text-sm"
                                />
                                <Button type="submit" size="sm" className="h-7 px-2 text-xs">Save</Button>
                                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setIsRenaming(false)}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </form>
                        ) : (
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm font-medium">{name}</h3>
                                <p className="text-muted-foreground text-xs">
                                    {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        )}

                        {/* Quick actions */}
                        {!isRenaming && (
                            <div className="opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="bg-background/80 h-8 w-8 border shadow-sm backdrop-blur-sm">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {menuItems}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>

                    {/* Expanded bookmarks list */}
                    {isOpen && bookmarks.length > 0 && (
                        <div className="border-t px-4 pb-4">
                            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {bookmarks.map((bookmark) => (
                                    <div
                                        key={bookmark._id}
                                        className="bg-muted/30 hover:bg-muted/60 group/item relative flex items-start gap-2 rounded-none border p-3 transition-colors"
                                    >
                                        <a
                                            href={bookmark.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex min-w-0 flex-1 items-start gap-2"
                                        >
                                            <div className="bg-background flex h-6 w-6 flex-shrink-0 items-center justify-center overflow-hidden rounded-none border">
                                                {getFaviconUrl(bookmark) ? (
                                                    <img
                                                        src={getFaviconUrl(bookmark)!}
                                                        alt=""
                                                        className="h-4 w-4"
                                                        onError={(e) => {
                                                            const t = e.target as HTMLImageElement;
                                                            t.style.display = 'none';
                                                            t.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`text-primary flex h-4 w-4 items-center justify-center text-xs font-medium ${getFaviconUrl(bookmark) ? 'hidden' : ''}`}>
                                                    {bookmark.title.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-1 text-xs font-medium leading-tight">{bookmark.title}</p>
                                                <p className="text-muted-foreground text-xs">{getDomain(bookmark.url)}</p>
                                            </div>
                                        </a>
                                        {/* Per-bookmark actions */}
                                        <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                title="Copy URL"
                                                onClick={() => navigator.clipboard.writeText(bookmark.url)}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                title="Open link"
                                                asChild
                                            >
                                                <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive h-6 w-6"
                                                title="Remove from folder"
                                                onClick={() => onRemoveBookmark(bookmark._id)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isOpen && bookmarks.length === 0 && (
                        <div className="border-t px-4 py-6 text-center">
                            <p className="text-muted-foreground text-xs">No bookmarks in this folder yet</p>
                        </div>
                    )}

                    {isOpen && (
                        <div className="border-t px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground h-7 gap-1.5 text-xs"
                                onClick={() => setIsAddingBookmark(true)}
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add bookmark
                            </Button>
                        </div>
                    )}
                </Card>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
                {contextMenuItems}
            </ContextMenuContent>
        </ContextMenu>

        {isAddingBookmark && (
            <AddBookmarkForm
                profileId={profileId}
                folderId={folderId}
                onClose={() => setIsAddingBookmark(false)}
            />
        )}
        </>
    );
}
