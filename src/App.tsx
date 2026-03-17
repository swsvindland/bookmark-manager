import { Authenticated, Unauthenticated } from 'convex/react';
import { useState } from 'react';
import { SignInForm } from './SignInForm';
import { Toaster } from 'sonner';
import { BookmarkManager } from './BookmarkManager';
import { MarketingPage } from './MarketingPage';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function App() {
    const [showLogin, setShowLogin] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Authenticated>
                <BookmarkManager />
            </Authenticated>
            <Unauthenticated>
                <MarketingPage onLoginClick={() => setShowLogin(true)} />

                <Dialog open={showLogin} onOpenChange={setShowLogin}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader className="space-y-1 text-center">
                            <DialogTitle className="text-3xl font-bold tracking-widest">
                                Bookmark Manager
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-xs uppercase tracking-wider">
                                Enter your credentials to access your bookmarks
                            </DialogDescription>
                        </DialogHeader>
                        <SignInForm />
                    </DialogContent>
                </Dialog>
            </Unauthenticated>
            <Toaster theme="system" />
        </div>
    );
}
