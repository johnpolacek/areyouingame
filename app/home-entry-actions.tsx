"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  getDraftTimeZone,
  pendingDraftStorageKey,
  persistBrowserTimeZoneCookie,
} from "@/lib/character-draft";
import { signupDisabledMessage } from "@/lib/signup-access-shared";
import { cn } from "@/lib/utils";
import { useSignupEnabled } from "./signup-access-provider";
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
  onDeclineRequest?: () => void;
  onJoinRequest?: () => void;
  showAuthActions?: boolean;
};

const choiceButtonClass = cn(
  primaryActionClass,
  "w-auto min-w-[8.5rem] flex-1 sm:min-w-[12rem] sm:flex-none",
);
const declineButtonClass =
  "h-12 w-auto min-w-[8.5rem] flex-1 rounded-lg border-border bg-card/70 px-6 font-accent text-[0.78rem] font-normal tracking-[0.06em] text-foreground uppercase shadow-lg shadow-black/10 backdrop-blur transition-all duration-500 ease-in-out hover:-translate-y-0.5 hover:bg-muted/80 active:translate-y-px dark:border-amber-600/45 dark:bg-slate-950/55 dark:text-amber-100 dark:shadow-amber-700/15 dark:hover:bg-amber-600/10 dark:hover:text-amber-50 sm:h-[4.5rem] sm:min-w-[12rem] sm:flex-none sm:px-8 sm:text-[1.12rem] sm:tracking-[0.08em]";

function ChoiceLabel({ children }: { children: ReactNode }) {
  return (
    <span className="relative z-[1] inline-flex translate-y-px items-center justify-center">
      {children}
    </span>
  );
}

export function HomeEntryActions(props: HomeEntryActionsProps) {
  const signupEnabled = useSignupEnabled();

  if (!signupEnabled) {
    return <DisabledHomeEntryActions {...props} />;
  }

  return <ClerkHomeEntryActions {...props} />;
}

function DisabledHomeEntryActions({
  onDeclineRequest,
  onJoinRequest,
  showAuthActions = false,
}: HomeEntryActionsProps) {
  const [showLocalAuthActions, setShowLocalAuthActions] = useState(false);
  const shouldShowAuthActions = showAuthActions || showLocalAuthActions;

  if (shouldShowAuthActions) {
    return (
      <PlayerCreationView
        actions={
          <Button className={`${primaryActionClass} hero-create-account`} disabled>
            <PrimaryActionLabel>Create Account</PrimaryActionLabel>
          </Button>
        }
        notice={signupDisabledMessage}
      >
        <fieldset
          className="contents"
          disabled
          aria-label="Character setup (sign ups closed)"
        >
          <CharacterSetupForm draft={emptyDraft} onChange={() => {}} />
        </fieldset>
      </PlayerCreationView>
    );
  }

  return (
    <div className="flex w-full max-w-[min(31rem,calc(100vw-2.5rem))] items-stretch justify-center gap-3 sm:gap-5">
      <Button
        className={choiceButtonClass}
        onClick={() => {
          if (onJoinRequest) {
            onJoinRequest();
            return;
          }

          setShowLocalAuthActions(true);
        }}
      >
        <ChoiceLabel>Yeah</ChoiceLabel>
      </Button>
      <Button
        className={declineButtonClass}
        onClick={onDeclineRequest}
        variant="outline"
      >
        <ChoiceLabel>Nah</ChoiceLabel>
      </Button>
    </div>
  );
}

function ClerkHomeEntryActions({
  onDeclineRequest,
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

  const declineButton = (
    <Button
      className={declineButtonClass}
      onClick={onDeclineRequest}
      variant="outline"
    >
      <ChoiceLabel>Nah</ChoiceLabel>
    </Button>
  );

  if (isLoaded && isSignedIn) {
    return (
      <div className="flex w-full max-w-[min(31rem,calc(100vw-2.5rem))] items-stretch justify-center gap-3 sm:gap-5">
        <Link
          className={cn(buttonVariants({ className: choiceButtonClass }))}
          href="/join"
        >
          <ChoiceLabel>Yeah</ChoiceLabel>
        </Link>
        {declineButton}
      </div>
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
    <div className="flex w-full max-w-[min(31rem,calc(100vw-2.5rem))] items-stretch justify-center gap-3 sm:gap-5">
      <Button
        className={choiceButtonClass}
        disabled={!isLoaded}
        onClick={() => {
          if (onJoinRequest) {
            onJoinRequest();
            return;
          }

          setShowLocalAuthActions(true);
        }}
      >
        <ChoiceLabel>Yeah</ChoiceLabel>
      </Button>
      {declineButton}
    </div>
  );
}
