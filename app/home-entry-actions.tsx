"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryActionClass =
  "h-24 w-full max-w-xl px-8 text-3xl font-semibold sm:h-32 sm:text-5xl";

export function HomeEntryActions() {
  const { isLoaded, isSignedIn } = useAuth();
  const [showAuthActions, setShowAuthActions] = useState(false);

  if (isLoaded && isSignedIn) {
    return (
      <Link
        className={cn(buttonVariants({ className: primaryActionClass }))}
        href="/join"
      >
        Join Game
      </Link>
    );
  }

  if (showAuthActions) {
    return (
      <div className="flex w-full flex-col items-center gap-3">
        <SignUpButton mode="modal" forceRedirectUrl="/join">
          <Button className={primaryActionClass}>Create Account</Button>
        </SignUpButton>
        <SignInButton mode="modal" forceRedirectUrl="/join">
          <Button className="h-9 px-4 text-sm font-semibold" variant="outline">
            Sign In
          </Button>
        </SignInButton>
      </div>
    );
  }

  return (
    <Button
      className={primaryActionClass}
      disabled={!isLoaded}
      onClick={() => setShowAuthActions(true)}
    >
      Join Game
    </Button>
  );
}
