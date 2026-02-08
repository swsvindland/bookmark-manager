import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { BookmarkManager } from "./BookmarkManager";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Authenticated>
        <BookmarkManager />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm h-16 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 shadow-sm px-4">
            <h2 className="text-xl font-semibold text-primary">Bookmark Manager</h2>
          </header>
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-primary mb-4">Your Personal Bookmark Hub</h1>
                <p className="text-xl text-secondary dark:text-gray-400">Sign in to organize your links across all devices</p>
              </div>
              <SignInForm />
            </div>
          </main>
        </div>
      </Unauthenticated>
      <Toaster theme="system" />
    </div>
  );
}
