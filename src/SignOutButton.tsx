"use client";
import { useAuthActions } from "@convex-dev/auth/react";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  // Shown while the session is still being restored too, so the header doesn't shift when it is
  const { signOut } = useAuthActions();

  return (
    <Button variant="outline" onClick={() => void signOut()}>
      <LogOut className="h-4 w-4" />
      <span className="sr-only md:not-sr-only">Sign out</span>
    </Button>
  );
}
