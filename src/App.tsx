import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { BookmarkManager } from "./BookmarkManager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function App() {
  return (
    <div className="min-h-screen bg-muted/40 dark:bg-gray-900">
      <Authenticated>
        <BookmarkManager />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
            <h2 className="text-xl font-bold tracking-tight">Bookmark Manager</h2>
          </header>
          <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
            <Card className="w-full max-w-md shadow-lg">
              <CardHeader className="text-center space-y-1">
                <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
                <CardDescription>
                  Enter your credentials to access your bookmarks
                </CardDescription>
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
