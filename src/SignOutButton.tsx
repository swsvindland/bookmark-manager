"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button variant="outline" onClick={() => void signOut()}>
      <LogOut className="h-4 w-4" />
      <span className="sr-only md:not-sr-only">Sign out</span>
    </Button>
  );
}
