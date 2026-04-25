"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryActionClass =
  "hero-join-button h-16 w-full max-w-[34rem] rounded-lg border border-[#ffe5aa]/70 px-8 text-2xl font-black text-[#06101c] shadow-none sm:h-24 sm:text-4xl";

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
      <div className="flex w-full flex-col items-center gap-4">
        <SignUpButton mode="modal" forceRedirectUrl="/join">
          <Button className={primaryActionClass}>Create Account</Button>
        </SignUpButton>
        <SignInButton mode="modal" forceRedirectUrl="/join">
          <Button
            className="rounded-md border-[#d8a55b]/45 bg-[#020711]/55 px-5 text-sm font-semibold text-[#f8dfb3] shadow-[0_0_22px_rgba(219,159,79,0.16)] backdrop-blur hover:bg-[#d8a55b]/12 hover:text-[#fff7e8]"
            variant="outline"
          >
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
