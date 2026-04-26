"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { Button, buttonVariants } from "@/components/ui/button";
import { pendingDraftStorageKey } from "@/lib/character-draft";
import { cn } from "@/lib/utils";
import {
  CharacterSetupForm,
  type CharacterDraft,
  type CharacterDraftField,
  emptyDraft,
  isCompleteDraft,
  PlayerCreationView,
  primaryActionClass,
  PrimaryActionLabel,
} from "./character-draft-form";

type HomeEntryActionsProps = {
  onJoinRequest?: () => void;
  showAuthActions?: boolean;
};

export function HomeEntryActions({
  onJoinRequest,
  showAuthActions = false,
}: HomeEntryActionsProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const [showLocalAuthActions, setShowLocalAuthActions] = useState(false);
  const [draft, setDraft] = useState<CharacterDraft>(emptyDraft);
  const shouldShowAuthActions = showAuthActions || showLocalAuthActions;
  const canCreateAccount = isCompleteDraft(draft);

  function updateDraft(field: CharacterDraftField, value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  function savePendingDraft() {
    if (!canCreateAccount) {
      return;
    }

    window.sessionStorage.setItem(
      pendingDraftStorageKey,
      JSON.stringify({
        ...draft,
        name: draft.name.trim(),
        age: draft.age.trim(),
        location: draft.location.trim(),
        occupation: draft.occupation.trim(),
        bio: draft.bio.trim(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      }),
    );
  }

  if (isLoaded && isSignedIn) {
    return (
      <Link
        className={cn(buttonVariants({ className: primaryActionClass }))}
        href="/join"
      >
        <PrimaryActionLabel>Join Game</PrimaryActionLabel>
      </Link>
    );
  }

  if (shouldShowAuthActions) {
    return (
      <PlayerCreationView
        actions={
          <>
            <SignUpButton mode="modal" forceRedirectUrl="/join">
              <Button
                className={`${primaryActionClass} hero-create-account`}
                disabled={!canCreateAccount}
                onClick={savePendingDraft}
              >
                <PrimaryActionLabel>Create Account</PrimaryActionLabel>
              </Button>
            </SignUpButton>
            <SignInButton mode="modal" forceRedirectUrl="/join">
              <Button
                className="hero-sign-in rounded-md border-amber-600/45 bg-slate-950/55 px-5 text-sm font-semibold text-amber-100 shadow-lg shadow-amber-700/15 backdrop-blur hover:bg-amber-600/10 hover:text-amber-50"
                onClick={savePendingDraft}
                variant="outline"
              >
                Sign In
              </Button>
            </SignInButton>
          </>
        }
      >
        <CharacterSetupForm draft={draft} onChange={updateDraft} />
      </PlayerCreationView>
    );
  }

  return (
    <Button
      className={primaryActionClass}
      disabled={!isLoaded}
      onClick={() => {
        if (onJoinRequest) {
          onJoinRequest();
          return;
        }

        setShowLocalAuthActions(true);
      }}
    >
      <PrimaryActionLabel>Join Game</PrimaryActionLabel>
    </Button>
  );
}
