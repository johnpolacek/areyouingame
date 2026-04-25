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
- Persistence model: Convex as the canonical backend for current structured world state and append-only event history.
- AI boundary: AI SDK as the LLM integration boundary for intent interpretation, classification, adjudication support, narration, and summarization. The LLM is not the source of truth for world state.
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
- Each daily game starts at one randomly selected global time of day. That instant is shared by every player, then rendered in each player's local timezone.
- After character creation, the first game screen uses the player's name, local event time, and player location to ask: `Hi John, it is <game-time-start> in <player-location>. Where are you and what are you doing?`
- The YES or NO choice must not appear in player creation or in the first location/activity prompt. It is reserved for a later reveal after the player has entered the scene.
- Player chat is private during the day. End-of-day results, summaries, and selected consequences become visible to everyone through the daily recap/archive.
- Each day should produce a durable recap that summarizes the game and preserves it as part of the growing archive.

## Durable Architecture Topics

Common topics include:

- system boundaries and runtime maps
- data or storage conventions
- integration contracts and operational boundaries
- project-wide UI or UX or design-system guidance

If the project does not yet need architecture guidance, this page may be removed during bootstrap review or later cleanup.
