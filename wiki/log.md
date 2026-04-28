# Project Wiki Log

Append durable project-wiki changes here. Prefer headings like `## [YYYY-MM-DD] type | title`.

## [2026-04-24] bootstrap | initialize project wiki

- Bootstrapped the standard project wiki structure with required maintenance files, the unified plans track, an optional architecture entrypoint, and source-artifact placeholders.
- Established the local wiki contract so future agents can maintain durable project context without relying on transient chat history.

## [2026-04-24] planning | add stage 01 homepage unit

- Added a second stage-01 unit for the centered `Are You In?` homepage so the current execution slice covers both the stack lock and the smallest visible app surface.
- Updated the MVP stage summary and stage-01 unit list to reflect the additional ready-now unit.

## [2026-04-24] architecture | lock initial stack decisions

- Recorded the MVP scaffold defaults in `Architecture.md`: Next.js, TypeScript, pnpm, Convex, AI SDK, Tailwind CSS, shadcn/ui, Base UI primitives, Vitest, and Playwright.
- Confirmed the stack lock is documentation-only and does not install packages, generate files, or change runtime code.

## [2026-04-24] implementation | add centered home page

- Added the minimal Next.js root route for Stage 01 Unit 02 with a single centered `Are You In?` `h1`.
- Verified the route builds and renders centered at desktop and mobile viewport sizes.

## [2026-04-24] planning | define daily game entry spine

- Updated the MVP roadmap around daily persistent game instances, `Join Today's Game`, Clerk-gated joining, one-player-per-user-per-day creation, private chat, and public end-of-day recaps.
- Added architecture notes for daily game ids, account/player boundaries, event-time handling, surprise YES/NO reveal timing, and recap visibility.
- Added planned MVP units for daily game auth entry, player creation, first private chat reveal, and daily lifecycle recaps.

## [2026-04-24] planning | split entry auth from player creation

- Repurposed Stage 02 from scaffold overlap into `Daily Game Entry And Auth`, reflecting that Stage 01 already covered the initial runnable scaffold.
- Narrowed Stage 03 to `Daily Player Creation` so Clerk-gated entry and one-player-per-day profile creation can be planned and implemented independently.
- Renamed the Stage 02 and Stage 03 plan files and updated the MVP current status so Stage 02 Unit 01 is the next execution unit.

## [2026-04-24] implementation | add Clerk-gated daily game entry

- Implemented Stage 02 Unit 01 with Clerk, a public `Join Today's Game` entry surface, a protected `/join` route, and placeholder authenticated destinations for player creation and today's game.
- Added daily game date-id and event-time helpers, Clerk proxy wiring, Clerk provider setup, and `.env.example` entries for the required Clerk keys.
- Verified TypeScript, production build, and local browser smoke behavior where `/join` redirects unauthenticated users to Clerk sign-in.

## [2026-04-25] implementation | add pre-auth character draft claim

- Added the first-screen character draft flow for Stage 03: users can enter character details before account creation, then `/join` claims the draft after Clerk auth.
- Added an authenticated player creation API and a temporary local `.data/players.json` development store that enforces one player per Clerk user id per daily game id.
- Verified TypeScript, production build, signed-out `/join` Clerk redirect behavior, and unauthorized player API protection.

## [2026-04-25] implementation | replace today placeholder with first prompt

- Updated the post-character `/game/today` surface to match the landing-page aesthetic and begin with the first in-world question.
- Clarified that each daily game has one shared random start instant rendered in each player's timezone.
- Moved the first location/activity answer out of character creation and into the opening game prompt.

## [2026-04-25] planning | define first move yes-no reveal

- Added the next Stage 05 unit for submitting the opening response through the AI SDK boundary and advancing to the YES/NO reveal.
- Locked the reveal copy: `A new way of being is available. Connection. Understanding. Freedom. Are you in?`
- Recorded the audio fallback instruction: `Please respond yes or no`.

## [2026-04-26] planning | select OpenAI model for first move

- Selected direct OpenAI via AI SDK for the first AI narration path.
- Set the planned model to `gpt-5.4-mini`.
- Recorded that audio output needs a separate later model decision because `gpt-5.4-mini` does not directly support audio output.

## [2026-04-26] planning | add public gameplay acknowledgement and legal-docs unit

- Added a `Before we begin` public-gameplay acknowledgement gate to the first private game chat opening unit.
- Added Stage 08 Unit 01 for formal Terms and Conditions and Privacy Policy work at the end of the MVP plan.
- Clarified that provisional MVP gameplay-term acknowledgement should later link to formal legal documents before public launch.

## [2026-04-26] planning | reorder chat before canonical memory

- Swapped the chat/action loop ahead of canonical state planning so `First Chat And Natural Language Action Loop` is now Stage 04.
- Merged the standalone Narrative Memory stub into `Canonical State, Event History, And Narrative Memory`, now Stage 05.
- Renumbered later MVP stages and unit folders so daily lifecycle is Stage 06 and hardening/legal work is Stage 07.

## [2026-04-26] planning | add first choice consequence unit

- Added Stage 04 Unit 03 for submitting the YES/NO choice, blocking duplicate decisions, and showing the first immediate consequence state.
- Kept full canonical state, append-only events, and narrative memory out of the unit so those systems remain the focus of Stage 05.

## [2026-04-26] implementation | split and implement opening response submission

- Split Stage 04 Unit 02 into a durable opening-response submission step before the AI-mediated YES/NO reveal.
- Renumbered the reveal work to Stage 04 Unit 03 and the YES/NO choice submission work to Stage 04 Unit 04.
- Implemented the opening prompt Send path so the player response is persisted once and reloads into a submitted state.

## [2026-04-26] implementation | add first move YES/NO reveal

- Implemented Stage 04 Unit 03 with AI SDK and the direct OpenAI provider for first-contact scene narration.
- Added durable first-move reveal state on the daily player record, including separated scene intro, fixed reveal copy, audio prompt text, model metadata, and `yes_no_pending` status.
- Replaced the response-submitted placeholder with a generation state and YES/NO reveal screen, using a deterministic fallback if AI generation fails.

## [2026-04-26] planning | pivot to production backend foundation

- Inserted Stage 04 Unit 04 for replacing the temporary local player store with a production backend before adding the YES/NO choice submission unit.
- Defined the backend split: Convex owns live transactional game state, while S3 flat files own stable/versioned artifacts such as recaps, exports, source imports, and approved narrative-memory bundles.
- Renumbered the YES/NO choice submission unit to Stage 04 Unit 05 and updated the MVP status, architecture notes, and older local-store assumptions.

## [2026-04-26] implementation | move current player state to Convex

- Added Convex schema/functions for daily games, players, current first-chat state, and S3 artifact metadata.
- Replaced the local `.data/players.json` implementation with a Convex-backed player-store adapter used by the existing Next.js routes.
- Added AWS SDK for Node.js S3 artifact storage helpers and environment documentation while keeping hot gameplay state in Convex.

## [2026-04-26] architecture | target real AWS S3 artifacts

- Confirmed artifact storage should use real AWS S3 through the AWS SDK for Node.js rather than a generic S3-compatible endpoint.
- Removed S3 endpoint and path-style settings from the application configuration surface.

## [2026-04-26] operations | record dev S3 IAM setup

- Recorded the dev artifact bucket setup: IAM user `areyouin-artifacts-dev`, policy `AreYouInArtifactDevBucketAccess`, and bucket `areyouin-artifacts-dev`.
- Noted that production still needs a separate S3 bucket, IAM user, IAM policy, and access keys before launch.

## [2026-04-26] implementation | submit first YES/NO decision

- Implemented Stage 04 Unit 05 with a Clerk-protected YES/NO submission route backed by Convex player ownership checks.
- Added an exactly-once first-decision record with reveal context, selected choice, submitted timestamp, and deterministic first consequence copy.
- Updated the today-game UI to submit YES or NO from the reveal and reload into the post-choice consequence state.

## [2026-04-26] planning | add text YES/NO deferral loop

- Added Stage 05 Unit 01 for text-based reveal responses that classify as YES, NO, or DEFERRED.
- Recorded that deferral is not a final skip choice: the central decision remains pending while interruption attempts are stored and answered.
- Planned the post-choice transition toward a generated narrative beat with an open textarea action instead of receipt-style confirmation copy.

## [2026-04-26] implementation | add text YES/NO deferral loop

- Implemented Stage 05 Unit 01 with a Clerk-protected text response route, AI SDK classifier boundary, and Convex persistence for reveal text attempts.
- Preserved explicit YES/NO buttons while adding open text classification, deferred interruption copy, duplicate final-decision protection, and refresh-safe pending/final states.
- Replaced the post-choice receipt with a selected YES/NO heading, consequence copy, and first post-choice action textarea backed by Convex persistence.

## [2026-04-27] implementation | add end-day deferral state

- Extended the first reveal text loop with an `END_DAY` classification for plausible sleep/rest/wait-until-morning actions.
- Preserved the core YES/NO pending invariant while allowing active play to close for the current daily session without forcing another interruption.
- Updated Stage 05 Unit 01 notes so end-day deferral is documented as a pending-state closure rather than a third final choice.

## [2026-04-28] implementation | add opening scene context questions

- Added temporary opening scene context so the game can ask one immediate in-world question when the first response lacks a fact needed to proceed.
- Stored opening scene-context answers separately from durable character memory; wake-time answers guide the current reveal without becoming long-term routine canon.
- Updated the first-move reveal prompt and fallback so sleeping characters are not forced awake at the event time or assigned an invented nearby phone.
