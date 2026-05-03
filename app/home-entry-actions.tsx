"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  getDraftTimeZone,
  pendingDraftStorageKey,
  persistBrowserTimeZoneCookie,
} from "@/lib/character-draft";
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
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [error, setError] = useState("");
  const shouldShowAuthActions = showAuthActions || showLocalAuthActions;
  const canCreateAccount = isCompleteDraft(draft);

  useEffect(() => {
    persistBrowserTimeZoneCookie();
  }, []);

  function updateDraft(field: CharacterDraftField, value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
    setError("");
  }

  async function generateDraft() {
    setIsGeneratingDraft(true);
    setError("");

    try {
      const response = await fetch("/api/players/character-draft/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draft: {
            name: draft.name,
            age: draft.age,
            location: draft.location,
            occupation: draft.occupation,
            appearance: draft.appearance,
            bio: draft.bio,
          },
        }),
      });
      const result = (await response.json()) as {
        draft?: Partial<CharacterDraft>;
        error?: string;
      };

      if (!response.ok || !result.draft) {
        throw new Error(result.error || "Unable to generate character.");
      }

      setDraft((currentDraft) => ({
        ...currentDraft,
        name: currentDraft.name.trim() || result.draft?.name || "",
        age: currentDraft.age.trim() || result.draft?.age || "",
        location:
          currentDraft.location.trim() || result.draft?.location || "",
        occupation:
          currentDraft.occupation.trim() || result.draft?.occupation || "",
        appearance:
          currentDraft.appearance.trim() || result.draft?.appearance || "",
        bio: currentDraft.bio.trim() || result.draft?.bio || "",
      }));
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Unable to generate character.",
      );
    } finally {
      setIsGeneratingDraft(false);
    }
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
        appearance: draft.appearance.trim(),
        bio: draft.bio.trim(),
        timeZone: getDraftTimeZone(),
        characterImageDataUrl: draft.characterImageDataUrl,
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
                className="hero-sign-in rounded-md border-border bg-card/70 px-5 text-sm font-semibold text-foreground shadow-lg shadow-black/10 backdrop-blur hover:bg-muted/80 dark:border-amber-600/45 dark:bg-slate-950/55 dark:text-amber-100 dark:shadow-amber-700/15 dark:hover:bg-amber-600/10 dark:hover:text-amber-50"
                onClick={savePendingDraft}
                variant="outline"
              >
                Sign In
              </Button>
            </SignInButton>
          </>
        }
        error={error}
      >
        <CharacterSetupForm
          draft={draft}
          isGeneratingDraft={isGeneratingDraft}
          onChange={updateDraft}
          onGenerateDraft={() => {
            void generateDraft();
          }}
          onImageChange={(characterImageDataUrl) =>
            setDraft((currentDraft) => ({
              ...currentDraft,
              characterImageDataUrl,
            }))
          }
        />
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
