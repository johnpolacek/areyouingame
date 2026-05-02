# Architecture

Use this page for optional durable cross-cutting reference guidance that does not fit cleanly into feature planning.

## Working Rule

- Treat this page as reference material, not as a substitute for execution plans.
- Keep roadmap capability work under `wiki/plans/mvp/` and route meaningful maintenance work through the most relevant existing plan file under `wiki/plans/`.
- Extend this page with clear sections only when the project has enough durable material to justify them.

## Initial Stack Decisions

These are the locked greenfield defaults for the MVP scaffold. They record the executable direction before package installation or file generation.

- Runtime shell: Next.js app runtime with TypeScript.
- Frontend tooling: Tailwind CSS for styling, shadcn/ui for application components, and Base UI primitives for lower-level accessible behavior where needed.
- Package manager: pnpm.
- Persistence model: Convex for live transactional game state and S3 flat files for stable/versioned artifacts.
- AI boundary: AI SDK as the LLM integration boundary for intent interpretation, classification, adjudication support, narration, and summarization. The LLM is not the source of truth for world state.
- First AI provider/model: direct OpenAI API through AI SDK using `gpt-5.4-mini` for text narration and structured reveal generation.
- Testing baseline: Vitest for isolated logic and Playwright for running app smoke checks.
- Source precedence: imported PRD, technical brief, wiki overview, roadmap, then supporting source artifacts.

## Daily Game Model

AreYouIn is organized around daily shared game instances.

- A new game opens each global day and receives a stable id based on its start date.
- Daily games persist after their start day. On launch day there is one active game; the next day there are two active games; each later day adds one more persistent game.
- The primary public action is `Join Today's Game`.
- `Join Today's Game` is visible publicly, but joining is gated by Clerk authentication.
- Account creation or sign-in happens before player creation.
- A player is one-per-user-per-day-game.
- The player creation form collects name, age, location, occupation, and bio.
- Each daily game has a stable date id based on the user's/browser's local date, not the character location.
- The first player-facing scene prompt uses the user's/browser's current local time when rendered, while still naming the character's in-world location.
- After character creation, the first game screen uses the player's name, user-local current time, and character location to ask: `Hi John, it is <user-current-local-time> in <player-location>. Where are you and what are you doing?`
- The YES or NO choice must not appear in player creation or in the first location/activity prompt. It is reserved for a later reveal after the player has entered the scene.
- The YES/NO reveal supports explicit `YES` and `NO` buttons plus an open text response. Open text can be classified as `YES`, `NO`, or deferred/no obvious choice.
- Deferred reveal responses do not complete the central decision and should not be stored as a third final choice. They keep the decision pending while recording the attempted action and returning another interruption that repeats the demand for yes or no.
- Gameplay is intended to be public live from the beginning: anyone can view player-visible prompts, player inputs, choices, narrator responses, scene titles, timestamps, and public character identity across all daily games while they happen.
- Joining and playing remain authenticated, but viewing live activity should not require sign-in.
- Public transcript visibility is limited to player-visible content and public character identity. Clerk/account ids, backend secrets, internal prompts, hidden structured facts, model metadata, token/cost data, and operator-only fields stay private.
- The first public browser route hierarchy is `/live`, `/live/[gameId]`, and `/live/[gameId]/[playerId]`.
- Public live game summaries show daily game id, event start label, player count, activity count, and last activity.
- Public game rooms show public character cards for a daily game.
- Public player pages assemble player-visible transcript entries from stored player state, including opening response, opening context, reveal, decision, reveal text responses, NO-path turns, YES connected-path turns, orb decision turns, and connected ASI turns.
- Public player queries omit `clerkUserId`; public transcript entries may still include player-visible model-authored text and route-level metadata needed for display, but should not include internal prompts, hidden structured facts, token/cost records, backend secrets, or operator-only audit fields.
- Each day may later produce a durable recap that summarizes the game and preserves it as part of the growing archive, but recaps are not the primary public visibility mechanism.

## Backend Storage Model

AreYouIn should use production-backed storage from the prototype stage onward.

- Convex is the source of truth for live gameplay state, auth-scoped mutations, uniqueness, ordering, current player progress, daily-game records, decisions, and queryable indexes.
- Convex should own reveal response attempts, decision classification outputs, pending-vs-submitted decision status, and first post-choice action state.
- AWS S3 flat files, written through the AWS SDK for Node.js, are the source of durable stable artifacts: source imports, approved narrative-memory bundles, generated recap snapshots, exports, audit bundles, and other versioned documents that should be cheap to preserve and easy to move.
- S3 should not own hot transactional state such as one-player-per-day enforcement, current reveal status, YES/NO uniqueness, or player mutation ordering.
- Convex should store S3 object keys, checksums, versions, publication status, ownership, and metadata whenever the app needs to discover or enforce behavior around an artifact.
- Browser-facing player mutations continue to go through Clerk-protected Next.js routes. Those routes call Convex with `AREYOUIN_BACKEND_SECRET`; the same secret must be configured in the Next.js runtime and Convex environment.
- After changing `.env.local`, run `pnpm convex:sync-secret` once to copy `AREYOUIN_BACKEND_SECRET` into the active Convex deployment selected by the local Convex config/environment, then restart `pnpm dev`.
- Use `pnpm convex:check-secret` to compare local and Convex secret fingerprints without printing the secret.
- The temporary `.data/players.json` store is not part of the target architecture and is no longer required by the current gameplay path.
- S3 artifact keys follow `areyouin/<scope>/artifacts/<artifactType>/<version>.json`, where `<scope>` is either `global` or `daily-games/<dailyGameId>`.
- The app targets real AWS S3, not a generic S3-compatible endpoint, so artifact storage config should only include bucket, region, and AWS credentials.
- Development artifact storage uses AWS IAM user `areyouin-artifacts-dev` with policy `AreYouInArtifactDevBucketAccess` for bucket `areyouin-artifacts-dev`.
- Production still needs its own S3 bucket, IAM user, IAM policy, and access keys before launch.

## Durable Architecture Topics

## AI Model Notes

- Use OpenAI `gpt-5.4-mini` for the first move text path.
- `gpt-5.4-mini` does not support audio output directly; voice delivery needs a separate later audio/TTS model decision.
- Keep the reveal copy deterministic even when AI narration is used, so the required YES/NO decision screen remains stable.
- Shared player-facing narration guidance lives in `lib/narrative-voice.ts`.
- Narration should be short, immediate, sensory, and interactive-fiction-like rather than analytical.
- Player-facing generated narration is sanitized to remove colons, semicolons, and em dashes from current response paths.
- Avoid recap phrases such as `What is visibly true now`, `What stays unknown`, `The split hardens`, `public reaction is no closer to consensus`, and `immediate and clean`.

## Current Gameplay UI Notes

- The active Day 1 game surface no longer renders a separate always-visible `Current Status` panel for answer, known, unknown, and objective.
- Structured state remains backend-owned and still informs prompts, public activity, and live transcript pages.
- The current scene view focuses on the latest transcript beat, player action, narrator response, an open action form when play can continue, and collapsible history.
- Action textareas intentionally have no placeholder copy; the UI should let the scene and label carry the next-action invitation.
- A disabled pending form can still appear for paused or currently complete paths, but it should not compete with an enabled action form.

Common topics include:

- system boundaries and runtime maps
- data or storage conventions
- integration contracts and operational boundaries
- project-wide UI or UX or design-system guidance

If the project does not yet need architecture guidance, this page may be removed during bootstrap review or later cleanup.
