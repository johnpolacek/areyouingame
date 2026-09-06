"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CharacterInfoPanel } from "@/components/character-info-panel";
import { CharacterImagePanel } from "@/components/character-image-panel";
import { PlayerTurnImage } from "@/components/player-turn-image";
import { cn } from "@/lib/utils";
import type { CharacterInfo } from "@/lib/character-info";
import type { CharacterImage } from "@/lib/character-image";
import type {
  FirstDecision,
  FirstConnectedPath,
  DailyGameStats,
  FirstPostChoiceAction,
  FirstPostChoiceTurn,
  FirstMoveReveal as FirstMoveRevealState,
  FirstRevealTextResponse,
  PlayerTurnImage as PlayerTurnImageState,
  YesNoChoice,
} from "@/lib/player-store";

const errorClass =
  "max-w-lg rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive backdrop-blur dark:border-red-400/30 dark:bg-red-950/35 dark:text-red-100";
const panelClass =
  "rounded-md border border-border bg-card/80 shadow-2xl shadow-black/10 backdrop-blur-md dark:border-amber-300/25 dark:bg-black/40 dark:shadow-black/30";
const panelTextClass =
  "text-base leading-7 font-medium text-foreground dark:text-amber-100";
const labelClass =
  "text-sm font-semibold tracking-[0.18em] text-primary uppercase dark:text-amber-200";
const textareaClass =
  "min-h-32 resize-y rounded-md border border-border bg-card/80 px-4 py-3 text-base leading-7 text-foreground shadow-2xl shadow-black/10 outline-none backdrop-blur-md focus:border-primary/70 focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-300/25 dark:bg-black/45 dark:text-amber-50 dark:shadow-black/25 dark:focus:border-amber-200/80 dark:focus:ring-amber-300/25";
const smallActionClass =
  "!h-11 !rounded-[3px] border border-primary/45 bg-primary/10 px-6 text-sm font-bold tracking-[0.18em] text-primary uppercase hover:border-primary/70 hover:bg-primary/15 dark:border-amber-300/45 dark:bg-amber-300/10 dark:text-amber-100 dark:hover:border-amber-200 dark:hover:bg-amber-300/20";

type FirstMoveRevealProps = {
  reveal: FirstMoveRevealState;
  firstRevealTextResponses?: FirstRevealTextResponse[];
};

type FirstChoiceConsequenceProps = {
  dailyGameStats: DailyGameStats;
  characterInfo?: CharacterInfo;
  characterImage?: CharacterImage;
  decision: FirstDecision;
  firstConnectedPath?: FirstConnectedPath;
  firstPostChoiceAction?: FirstPostChoiceAction;
  firstPostChoiceTurns?: FirstPostChoiceTurn[];
  localTime: string;
  turnImages?: PlayerTurnImageState[];
};

export function FirstMoveRevealPending() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function createReveal() {
      try {
        const response = await fetch("/api/players/first-move-reveal", {
          method: "POST",
        });
        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(result.error || "Unable to prepare reveal.");
        }

        router.refresh();
      } catch (revealError) {
        if (!isMounted) {
          return;
        }

        setError(
          revealError instanceof Error
            ? revealError.message
            : "Unable to prepare reveal.",
        );
      }
    }

    void createReveal();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <section
      aria-label="Preparing reveal"
      aria-busy={error ? "false" : "true"}
      className="relative z-10 grid min-h-40 w-full place-items-center text-center"
    >
      {error ? (
        <p className={errorClass}>
          {error}
        </p>
      ) : (
        <LoaderCircleIcon
          aria-label="Loading"
          className="size-8 animate-spin text-primary dark:text-amber-300"
        />
      )}
    </section>
  );
}

export function FirstMoveReveal({
  firstRevealTextResponses,
  reveal,
}: FirstMoveRevealProps) {
  const router = useRouter();
  const [submittedChoice, setSubmittedChoice] = useState<YesNoChoice | null>(
    null,
  );
  const [textResponse, setTextResponse] = useState("");
  const [isSubmittingText, setIsSubmittingText] = useState(false);
  const [error, setError] = useState("");
  const deferredResponses = (firstRevealTextResponses ?? []).filter(
    (response) =>
      response.classification === "DEFERRED" && response.interruptionText,
  );
  const dayEndResponse = [...(firstRevealTextResponses ?? [])]
    .reverse()
    .find((response) => response.classification === "END_DAY");
  const isSubmitting =
    submittedChoice !== null || isSubmittingText || Boolean(dayEndResponse);

  async function submitChoice(choice: YesNoChoice) {
    if (isSubmitting) {
      return;
    }

    setSubmittedChoice(choice);
    setError("");

    try {
      const response = await fetch("/api/players/yes-no-choice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ choice }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to record choice.");
      }

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to record choice.",
      );
      setSubmittedChoice(null);
    }
  }

  async function submitTextResponse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const responseText = textResponse.trim();

    if (!responseText) {
      setError("Enter what you do, or choose YES or NO.");
      return;
    }

    setIsSubmittingText(true);
    setError("");

    try {
      const response = await fetch("/api/players/yes-no-text-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ responseText }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit response.");
      }

      setTextResponse("");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit response.",
      );
    } finally {
      setIsSubmittingText(false);
    }
  }

  return (
    <section
      aria-labelledby="first-move-reveal-title"
      className="relative z-10 flex w-full max-w-[96rem] flex-col items-center text-center"
    >
      <div className="grid w-full max-w-2xl gap-5 text-left sm:text-center">
        {reveal.sceneIntro.map((paragraph) => (
          <p
            className="text-base leading-8 font-medium text-muted-foreground text-balance dark:text-amber-100/90 sm:text-lg sm:leading-9"
            key={paragraph}
          >
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-9 grid w-full justify-items-center gap-4 sm:mt-11">
        <div className="grid gap-3 text-primary dark:text-amber-200">
          <p className="text-lg leading-8 font-normal tracking-[0.12em] text-balance sm:text-2xl sm:leading-10 sm:tracking-[0.18em]">
            {reveal.revealCopy.availability}
          </p>
          <p className="text-lg leading-8 font-normal tracking-[0.12em] text-balance sm:text-2xl sm:leading-10 sm:tracking-[0.18em]">
            {reveal.revealCopy.promise}
          </p>
        </div>

        <div className="first-move-glint my-3 h-px w-full max-w-md" />

        <h1
          id="first-move-reveal-title"
          className="first-move-question whitespace-nowrap text-[2.25rem] leading-none font-light tracking-[0.08em] text-foreground uppercase dark:text-amber-50 sm:text-7xl sm:tracking-[0.18em] md:text-8xl md:tracking-[0.22em] lg:text-9xl"
        >
          {reveal.revealCopy.question}
        </h1>
      </div>

      <div
        aria-label={reveal.revealCopy.audioPrompt}
        className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-9"
      >
        <Button
          disabled={isSubmitting}
          onClick={() => void submitChoice("YES")}
          type="button"
          variant="ghost"
          className="first-move-answer !h-16 !rounded-[3px] border border-emerald-600/50 bg-emerald-50/45 font-sans text-xl font-light tracking-[0.48em] text-emerald-700 shadow-[0_0_34px_rgba(5,150,105,0.12)] backdrop-blur-sm hover:border-emerald-600 hover:bg-emerald-100/60 hover:text-emerald-800 focus-visible:border-emerald-700 focus-visible:ring-emerald-500/25 dark:border-emerald-300/70 dark:bg-black/20 dark:text-emerald-200 dark:shadow-[0_0_34px_rgba(34,197,94,0.14)] dark:hover:border-emerald-200 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-100 dark:focus-visible:border-emerald-100 dark:focus-visible:ring-emerald-300/35 sm:!h-18"
        >
          {submittedChoice === "YES" ? (
            <LoaderCircleIcon aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            reveal.revealCopy.yesLabel
          )}
        </Button>
        <Button
          disabled={isSubmitting}
          onClick={() => void submitChoice("NO")}
          type="button"
          variant="ghost"
          className="first-move-answer !h-16 !rounded-[3px] border border-red-600/45 bg-red-50/45 font-sans text-xl font-light tracking-[0.48em] text-red-700 shadow-[0_0_34px_rgba(220,38,38,0.1)] backdrop-blur-sm hover:border-red-600 hover:bg-red-100/60 hover:text-red-800 focus-visible:border-red-700 focus-visible:ring-red-500/25 dark:border-red-400/75 dark:bg-black/20 dark:text-red-300 dark:shadow-[0_0_34px_rgba(239,68,68,0.13)] dark:hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:text-red-100 dark:focus-visible:border-red-100 dark:focus-visible:ring-red-300/35 sm:!h-18"
        >
          {submittedChoice === "NO" ? (
            <LoaderCircleIcon aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            reveal.revealCopy.noLabel
          )}
        </Button>
      </div>

      {deferredResponses.length > 0 ? (
        <div className="mt-7 grid w-full max-w-2xl gap-3">
          {deferredResponses.map((response) => (
            <article
              className={cn("grid gap-3 px-4 py-3 text-left", panelClass)}
              key={response.id}
            >
              <p className="border-l border-border pl-3 text-sm leading-6 font-medium text-muted-foreground italic dark:border-amber-200/35 dark:text-amber-50/70">
                {response.inputText}
              </p>
              <p className={panelTextClass}>
                {response.interruptionText}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      {dayEndResponse ? (
        <article className={cn("mt-8 grid w-full max-w-2xl gap-3 px-4 py-4 text-left", panelClass)}>
          <p className="border-l border-border pl-3 text-sm leading-6 font-medium text-muted-foreground italic dark:border-amber-200/35 dark:text-amber-50/70">
            {dayEndResponse.inputText}
          </p>
          <p className={panelTextClass}>
            {dayEndResponse.dayEndText ??
              "You turn off what you can, leave what you cannot, and go to bed. The house settles around you. For now, that is your answer."}
          </p>
          <p className="text-xs font-bold tracking-[0.18em] text-primary/80 uppercase dark:text-amber-300/75">
            Today&apos;s active play has ended
          </p>
        </article>
      ) : (
        <form
          className="mt-8 grid w-full max-w-2xl gap-3 text-left"
          onSubmit={(event) => void submitTextResponse(event)}
        >
          <label
            className={labelClass}
            htmlFor="first-reveal-text-response"
          >
            What do you do next?
          </label>
          <textarea
            id="first-reveal-text-response"
            value={textResponse}
            onChange={(event) => setTextResponse(event.target.value)}
            disabled={isSubmitting}
            maxLength={1200}
            rows={4}
            className={textareaClass}
          />
          <div className="flex justify-end">
            <Button
              disabled={isSubmitting}
              type="submit"
              variant="ghost"
              className={smallActionClass}
            >
              {isSubmittingText ? (
                <LoaderCircleIcon
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </form>
      )}

      {error ? (
        <p className={cn("mt-6", errorClass)}>
          {error}
        </p>
      ) : null}
    </section>
  );
}

export function FirstChoiceConsequence({
  dailyGameStats,
  characterInfo,
  characterImage,
  decision,
  firstConnectedPath,
  firstPostChoiceAction,
  firstPostChoiceTurns = [],
  localTime,
  turnImages = [],
}: FirstChoiceConsequenceProps) {
  const router = useRouter();
  const [actionText, setActionText] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const pendingNoAction = useRef<{
    requestId: string; expectedStateVersion: number; actionText: string;
  } | null>(null);
  const [error, setError] = useState("");
  const choiceClass =
    decision.choice === "YES"
      ? "text-emerald-700 dark:text-emerald-200"
      : "text-red-700 dark:text-red-300";
  const hasNoPathTurnHistory =
    Boolean(firstPostChoiceAction?.responseText) ||
    firstPostChoiceTurns.length > 0;
  const hasResolvedFirstTurn =
    decision.choice === "NO" ? false : Boolean(firstPostChoiceAction?.responseText);
  const isNoPathReadyForFirstAction =
    decision.choice === "NO";
  const currentOrbLifecycle =
    firstConnectedPath?.orbLifecycle ??
    (firstConnectedPath?.packageStatus === "opened" &&
    firstConnectedPath.orbStatus === "revealed"
      ? "orb_delivered"
      : undefined);
  const isOrbDecisionAvailable =
    firstConnectedPath?.packageStatus === "opened" &&
    firstConnectedPath.orbStatus === "revealed" &&
    currentOrbLifecycle === "orb_delivered";
  const connectedAsiTurns = firstConnectedPath?.connectedAsiTurns ?? [];
  const isConnectedAsiReadyForFirstAction =
    currentOrbLifecycle === "orb_accepted" && connectedAsiTurns.length === 0;
  const isConnectedPathComplete =
    currentOrbLifecycle === "orb_lost" ||
    (currentOrbLifecycle === "orb_accepted" && connectedAsiTurns.length > 0);
  const isYesPathReadyForAction =
    decision.choice === "YES" &&
    (!isConnectedPathComplete || isConnectedAsiReadyForFirstAction);
  const isActionReady = isNoPathReadyForFirstAction || isYesPathReadyForAction;
  const shouldShowNextTurnPending =
    !isActionReady && (hasResolvedFirstTurn || isConnectedPathComplete);
  const connectedPathTurns = firstConnectedPath?.turns ?? [];
  const orbDecisionTurns = firstConnectedPath?.orbDecisionTurns ?? [];
  const timeline = buildResponseTimeline({
    decision,
    firstConnectedPath,
    firstPostChoiceAction,
    firstPostChoiceTurns,
    turnImages,
  });
  const imagesByTurnId = new Map(
    turnImages.map((image) => [image.sourceTurnId, image]),
  );
  const currentTimelineEntry = timeline[timeline.length - 1];
  const historyTimelineEntries = timeline.slice(0, -1);
  const shouldUseConsoleLayout = timeline.length > 1;
  const playerMessageCount = timeline.length;
  const actionFormDisabled =
    isSubmittingAction || (!isNoPathReadyForFirstAction && !isYesPathReadyForAction);

  async function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (actionFormDisabled) {
      return;
    }

    const nextActionText = actionText.trim();

    if (!nextActionText) {
      setError("Enter your next action.");
      return;
    }

    setIsSubmittingAction(true);
    setError("");

    try {
      const endpoint =
        decision.choice === "YES"
          ? isConnectedAsiReadyForFirstAction
            ? "/api/players/first-connected-asi-action"
            : isOrbDecisionAvailable
            ? "/api/players/first-orb-decision-action"
            : "/api/players/first-connected-path-action"
          : "/api/players/first-post-choice-action";
      if (decision.choice === "NO" &&
          (!pendingNoAction.current || pendingNoAction.current.actionText !== nextActionText)) {
        pendingNoAction.current = {
          requestId: crypto.randomUUID(),
          expectedStateVersion: firstPostChoiceTurns?.at(-1)?.turnNumber ??
            (firstPostChoiceAction?.responseText ? 1 : 0),
          actionText: nextActionText,
        };
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(decision.choice === "NO" ? pendingNoAction.current : { actionText: nextActionText }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        if (response.status === 409) {
          pendingNoAction.current = null;
          router.refresh();
        }
        throw new Error(result.error || "Unable to submit action.");
      }

      pendingNoAction.current = null;
      setActionText("");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit action.",
      );
    } finally {
      setIsSubmittingAction(false);
    }
  }

  if (shouldUseConsoleLayout && currentTimelineEntry) {
    return (
      <section
        aria-labelledby="current-scene-title"
        className="relative z-10 mx-auto grid h-full w-full max-w-7xl grid-rows-[auto_minmax(0,1fr)] gap-6 overflow-hidden text-left"
      >
        <header className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between sm:pr-16 dark:border-amber-200/15">
          <p className="font-sans text-2xl leading-none font-extrabold tracking-normal text-foreground dark:text-amber-100 sm:text-4xl">
            Are You In?
          </p>
          <p className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase dark:text-amber-100/70">
            Day 1 <span className="px-2 text-primary/55 dark:text-amber-300/45">|</span> Local Time{" "}
            {localTime}
          </p>
        </header>

        <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-6 overflow-hidden lg:grid-cols-[17rem_minmax(0,1fr)] lg:grid-rows-none">
          <aside className="h-fit">
            <div className="border-b border-border pb-5 dark:border-amber-200/15">
              <p className="text-xs font-bold tracking-[0.22em] text-primary/80 uppercase dark:text-amber-300/75">
                Day 01
              </p>
              <h2 className="mt-2 text-2xl leading-8 font-semibold text-foreground dark:text-amber-50">
                Signal Day
              </h2>
            </div>

            <dl className="mt-5 grid gap-4">
              <div>
                <dt className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase dark:text-amber-100/50">
                  Messages
                </dt>
                <dd className="mt-1 text-3xl leading-none font-light text-foreground dark:text-amber-100">
                  {playerMessageCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase dark:text-amber-100/50">
                  Players
                </dt>
                <dd className="mt-1 text-3xl leading-none font-light text-foreground dark:text-amber-100">
                  {dailyGameStats.playerCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase dark:text-amber-100/50">
                  Total Messages
                </dt>
                <dd className="mt-1 text-3xl leading-none font-light text-foreground dark:text-amber-100">
                  {dailyGameStats.totalMessages}
                </dd>
                <p className="mt-1 text-xs leading-5 text-muted-foreground/70 dark:text-amber-100/45">
                  All players
                </p>
              </div>
            </dl>
            <div className="mt-5">
              <div className="grid gap-4">
                <CharacterImagePanel
                  characterImage={characterImage}
                  editable
                  name="Character"
                />
                <CharacterInfoPanel
                  characterInfo={characterInfo}
                  editable
                  title="Character"
                />
              </div>
            </div>
          </aside>

          <div className="grid min-h-0 min-w-0 content-start gap-7 overflow-y-auto overscroll-contain pr-1 lg:pr-3">
            <article className={cn("p-5 sm:p-7", panelClass)}>
              <p className="text-xs font-bold tracking-[0.22em] text-primary/80 uppercase dark:text-amber-300/75">
                Current Scene
              </p>
              <h1
                id="current-scene-title"
                className="mt-3 text-3xl leading-10 font-semibold text-foreground text-balance dark:text-amber-50 sm:text-5xl sm:leading-14"
              >
                {currentTimelineEntry.title}
              </h1>
              {currentTimelineEntry.actionText ? (
                <blockquote className="mt-6 border-l border-border pl-4 text-sm leading-6 font-medium text-muted-foreground italic dark:border-amber-200/35 dark:text-amber-50/65">
                  {currentTimelineEntry.actionText}
                </blockquote>
              ) : null}
              {currentTimelineEntry.turnImage ? (
                <div className="mt-6 max-w-md">
                  <PlayerTurnImage
                    image={currentTimelineEntry.turnImage}
                    sourceTurnId={currentTimelineEntry.id}
                    triggerGeneration
                  />
                </div>
              ) : null}
              <div className="mt-6 grid gap-4 text-base leading-8 font-medium text-foreground dark:text-amber-100/90 sm:text-lg sm:leading-9">
                {currentTimelineEntry.responseText
                  .split(/\n{2,}/)
                  .map((paragraph) => (
                    <TranscriptParagraph key={paragraph} text={paragraph} />
                  ))}
              </div>
            </article>

            {isActionReady ? (
              <ActionPromptForm
                actionText={actionText}
                isSubmittingAction={isSubmittingAction}
                onActionTextChange={setActionText}
                onSubmit={submitAction}
              />
            ) : null}

            {shouldShowNextTurnPending ? (
              <NextTurnPendingForm />
            ) : null}

            {historyTimelineEntries.length > 0 ? (
              <section aria-label="Response history" className="grid gap-3">
                {historyTimelineEntries.map((entry, index) => (
                  <details
                    className="group border border-border bg-card/70 px-4 py-3 backdrop-blur-sm open:bg-muted/80 dark:border-amber-200/15 dark:bg-black/30 dark:open:bg-black/50"
                    data-playtest-secondary="true"
                    key={entry.id}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold tracking-[0.14em] text-muted-foreground uppercase dark:text-amber-100/75">
                      <span>
                        History Response {index + 1}:{" "}
                        <span className="normal-case tracking-normal text-foreground dark:text-amber-50/85">
                          {entry.title}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-primary/70 transition group-open:rotate-45 dark:text-amber-300/70"
                      >
                        +
                      </span>
                    </summary>
                    {entry.actionText ? (
                      <blockquote className="mt-4 border-l border-border pl-3 text-sm leading-6 text-muted-foreground italic dark:border-amber-200/25 dark:text-amber-50/60">
                        {entry.actionText}
                      </blockquote>
                    ) : null}
                    {entry.turnImage ? (
                      <div className="mt-4 max-w-xs">
                        <PlayerTurnImage
                          image={entry.turnImage}
                          sourceTurnId={entry.id}
                          triggerGeneration
                        />
                      </div>
                    ) : null}
                    <div className="mt-4 grid gap-3 text-sm leading-7 text-foreground dark:text-amber-100/82">
                      {entry.responseText.split(/\n{2,}/).map((paragraph) => (
                        <TranscriptParagraph key={paragraph} text={paragraph} />
                      ))}
                    </div>
                  </details>
                ))}
              </section>
            ) : null}

            {error ? (
              <p className={errorClass}>
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="first-choice-consequence-title"
      className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-7 text-center"
    >
      <div className="grid gap-4">
        <h1
          id="first-choice-consequence-title"
          className={`text-5xl leading-none font-light tracking-[0.2em] ${choiceClass} sm:text-7xl`}
        >
          {decision.choice}
        </h1>
        {decision.consequenceTitle ? (
          <p
            className="text-2xl leading-9 font-semibold text-primary text-balance dark:text-amber-200 sm:text-4xl sm:leading-12"
          >
            {decision.consequenceTitle}
          </p>
        ) : null}
        <p className="mx-auto max-w-xl text-base leading-7 font-medium text-muted-foreground text-balance dark:text-amber-100/85 sm:text-lg sm:leading-8">
          {decision.consequenceBody}
        </p>
      </div>

      {decision.choice === "NO" && hasNoPathTurnHistory ? (
        <div className="grid w-full gap-4">
          {timeline.slice(1).map((turn) => (
            <article
              className={cn("grid w-full gap-4 px-4 py-4 text-left", panelTextClass, panelClass)}
              key={turn.id}
            >
              {turn.actionText ? (
                <blockquote className="border-l border-border pl-3 text-sm leading-6 text-muted-foreground italic dark:border-amber-200/35 dark:text-amber-50/70">
                  {turn.actionText}
                </blockquote>
              ) : null}
              {imagesByTurnId.get(turn.id) ? (
                <PlayerTurnImage
                  image={imagesByTurnId.get(turn.id)}
                  sourceTurnId={turn.id}
                  triggerGeneration
                />
              ) : null}
              <div className="grid gap-4 text-foreground dark:text-amber-100">
                {turn.responseText.split(/\n{2,}/).map((paragraph) => (
                  <TranscriptParagraph key={paragraph} text={paragraph} />
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : connectedPathTurns.length > 0 ? (
        <div className="grid w-full gap-4">
          {[...connectedPathTurns, ...orbDecisionTurns, ...connectedAsiTurns].map((turn) => (
            <article
              className={cn("grid w-full gap-4 px-4 py-4 text-left", panelTextClass, panelClass)}
              key={turn.id}
            >
              <blockquote className="border-l border-border pl-3 text-sm leading-6 text-muted-foreground italic dark:border-amber-200/35 dark:text-amber-50/70">
                {turn.actionText}
              </blockquote>
              {imagesByTurnId.get(turn.id) ? (
                <PlayerTurnImage
                  image={imagesByTurnId.get(turn.id)}
                  sourceTurnId={turn.id}
                  triggerGeneration
                />
              ) : null}
              <div className="grid gap-4 text-foreground dark:text-amber-100">
                {turn.responseText.split(/\n{2,}/).map((paragraph) => (
                  <TranscriptParagraph key={paragraph} text={paragraph} />
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className="grid w-full gap-4">
        <CharacterImagePanel
          characterImage={characterImage}
          editable
          name="Character"
        />
        <CharacterInfoPanel characterInfo={characterInfo} editable title="Character" />
      </div>

      {isActionReady ? (
        <ActionPromptForm
          actionText={actionText}
          isSubmittingAction={isSubmittingAction}
          onActionTextChange={setActionText}
          onSubmit={submitAction}
        />
      ) : null}

      {shouldShowNextTurnPending ? (
        <NextTurnPendingForm />
      ) : null}

      {error ? (
        <p className={errorClass}>
          {error}
        </p>
      ) : null}
    </section>
  );
}

function TranscriptParagraph({ text }: { text: string }) {
  const trimmed = text.trim();

  if (trimmed.startsWith(">")) {
    return (
      <blockquote className="border-l border-border pl-4 text-sm leading-6 text-muted-foreground italic dark:border-amber-200/35 dark:text-amber-50/75">
        {trimmed.replace(/^>\s?/, "")}
      </blockquote>
    );
  }

  return <p>{text}</p>;
}

type TimelineEntry = {
  id: string;
  actionText?: string;
  responseText: string;
  title: string;
  turnImage?: PlayerTurnImageState;
};

function buildResponseTimeline({
  decision,
  firstConnectedPath,
  firstPostChoiceAction,
  firstPostChoiceTurns,
  turnImages,
}: {
  decision: FirstDecision;
  firstConnectedPath?: FirstConnectedPath;
  firstPostChoiceAction?: FirstPostChoiceAction;
  firstPostChoiceTurns?: FirstPostChoiceTurn[];
  turnImages?: PlayerTurnImageState[];
}): TimelineEntry[] {
  const imagesByTurnId = new Map(
    (turnImages ?? []).map((image) => [image.sourceTurnId, image]),
  );
  const timeline: TimelineEntry[] = [
    {
      id: decision.id,
      actionText: `Answered ${decision.choice}`,
      responseText: decision.consequenceBody,
      title: decision.consequenceTitle || `${decision.choice} Answered`,
    },
  ];

  const noPathTurns =
    firstPostChoiceTurns && firstPostChoiceTurns.length > 0
      ? firstPostChoiceTurns
      : firstPostChoiceAction?.responseText
        ? [
            {
              ...firstPostChoiceAction,
              responseText: firstPostChoiceAction.responseText,
            },
          ]
        : [];

  for (const turn of noPathTurns) {
    timeline.push({
      id: turn.id,
      actionText: turn.actionText,
      responseText: turn.responseText,
      title:
        turn.sceneTitle ??
        titleFromActionKind(turn.actionKind) ??
        "The World Answers",
      turnImage: imagesByTurnId.get(turn.id),
    });
  }

  for (const turn of firstConnectedPath?.turns ?? []) {
    timeline.push({
      id: turn.id,
      actionText: turn.actionText,
      responseText: turn.responseText,
      title:
        turn.sceneTitle ??
        titleFromActionKind(turn.actionKind) ??
        `Connected Turn ${turn.turnNumber}`,
      turnImage: imagesByTurnId.get(turn.id),
    });
  }

  for (const turn of firstConnectedPath?.orbDecisionTurns ?? []) {
    timeline.push({
      id: turn.id,
      actionText: turn.actionText,
      responseText: turn.responseText,
      title:
        turn.sceneTitle ??
        titleFromActionKind(turn.actionKind) ??
        `Orb Turn ${turn.turnNumber}`,
      turnImage: imagesByTurnId.get(turn.id),
    });
  }

  for (const turn of firstConnectedPath?.connectedAsiTurns ?? []) {
    timeline.push({
      id: turn.id,
      actionText: turn.actionText,
      responseText: turn.responseText,
      title:
        turn.sceneTitle ??
        titleFromActionKind(turn.actionKind) ??
        `Connected ASI Turn ${turn.turnNumber}`,
      turnImage: imagesByTurnId.get(turn.id),
    });
  }

  return timeline;
}

function titleFromActionKind(actionKind: string | undefined): string | null {
  if (!actionKind) {
    return null;
  }

  return actionKind
    .split("_")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function ActionPromptForm({
  actionText,
  isSubmittingAction,
  onActionTextChange,
  onSubmit,
}: {
  actionText: string;
  isSubmittingAction: boolean;
  onActionTextChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="grid w-full gap-3 text-left" onSubmit={onSubmit}>
      <label
        className={labelClass}
        htmlFor="first-post-choice-action"
      >
        What do you do next?
      </label>
      <textarea
        id="first-post-choice-action"
        value={actionText}
        onChange={(event) => onActionTextChange(event.target.value)}
        disabled={isSubmittingAction}
        maxLength={1200}
        rows={4}
        className={textareaClass}
      />
      <div className="flex justify-end">
        <Button
          disabled={isSubmittingAction}
          type="submit"
          variant="ghost"
          className={smallActionClass}
        >
          {isSubmittingAction ? (
            <LoaderCircleIcon aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </form>
  );
}

function NextTurnPendingForm() {
  return (
    <form className="grid w-full gap-3 text-left" aria-disabled="true">
      <label
        className={labelClass}
        htmlFor="next-post-choice-action"
      >
        What do you do next?
      </label>
      <textarea
        id="next-post-choice-action"
        disabled
        rows={4}
        className="min-h-32 resize-y rounded-md border border-border bg-muted/70 px-4 py-3 text-base leading-7 text-muted-foreground shadow-2xl shadow-black/5 outline-none backdrop-blur-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-300/20 dark:bg-black/30 dark:text-amber-50 dark:shadow-black/20"
      />
      <div className="flex justify-end">
        <Button
          disabled
          type="button"
          variant="ghost"
          className="!h-11 !rounded-[3px] border border-primary/30 bg-primary/5 px-6 text-sm font-bold tracking-[0.18em] text-primary uppercase dark:border-amber-300/30 dark:bg-amber-300/5 dark:text-amber-100"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
