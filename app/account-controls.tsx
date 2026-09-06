"use client";

import { useEffect, useState } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import { useSignupEnabled } from "./signup-access-provider";
import { ThemeToggle } from "./theme-provider";

export function AccountControls() {
  const [isMounted, setIsMounted] = useState(false);
  const signupEnabled = useSignupEnabled();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className="fixed top-5 right-5 z-20 inline-flex items-center gap-3"
      aria-label="Account and display settings"
    >
      <ThemeToggle />
      {isMounted && signupEnabled ? (
        <Show when="signed-in">
          <UserButton />
        </Show>
      ) : null}
    </div>
  );
}
