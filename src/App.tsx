import { Authenticated, Unauthenticated, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { SignInForm } from './SignInForm';
import { SignOutButton } from './SignOutButton';
import { Toaster } from 'sonner';
import { BookmarkManager } from './BookmarkManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function App() {
    return (
        <div className="min-h-screen bg-background">
            <Authenticated>
                <BookmarkManager />
            </Authenticated>
            <Unauthenticated>
                <div className="flex min-h-screen flex-col">
                    <main className="flex flex-1 items-center justify-center p-4 sm:p-8 relative">
                        <Card className="card-psycho w-full max-w-md border-border shadow-lg">
                            <CardHeader className="space-y-1 text-center">
                                <CardTitle className="text-3xl font-bold tracking-widest">
                                    <h1>Bookmark Manager</h1>
                                </CardTitle>
                                <CardDescription className="text-muted-foreground tracking-wider text-xs uppercase">Enter your credentials to access your bookmarks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SignInForm />
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </Unauthenticated>
            <Toaster theme="system" />
        </div>
    );
}
