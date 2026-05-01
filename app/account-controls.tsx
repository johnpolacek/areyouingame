"use client";

import { useEffect, useState } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./theme-provider";

export function AccountControls() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className="fixed top-5 right-5 z-20 inline-flex items-center gap-3"
      aria-label="Account and display settings"
    >
      <ThemeToggle />
      {isMounted ? (
        <Show when="signed-in">
          <UserButton />
        </Show>
      ) : null}
    </div>
  );
}
