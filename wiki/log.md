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
