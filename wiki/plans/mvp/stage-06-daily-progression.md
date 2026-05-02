# Stage 06: Daily Game Lifecycle And Live Public Activity

## Stage Goal

Plan and implement the global daily game lifecycle with live public gameplay visibility from the beginning: one new persistent game opens per global day, each game receives a start-date id, active games accumulate over time, and anyone can view player-visible activity across all games while it happens.

## Current Status

In progress. A first public live browser is implemented:

- `/live` lists public game rooms.
- `/live/[gameId]` lists public player cards for a daily game.
- `/live/[gameId]/[playerId]` shows a player-visible transcript assembled from stored gameplay state.
- Convex stores public activity records and public character/player snapshots separate from operator/internal event history.

Remaining Stage 06 work includes realtime refresh or push behavior, route/navigation polish, explicit public payload allowlist tests, and broader daily lifecycle hardening across accumulated games.

## Scope

- Include: daily game creation, global event timing, active/archive status, public activity browsing, public transcript event records, and player continuity across daily games.
- Exclude: detailed LLM adjudication internals, moderation tooling, and private/operator event-history UI.

## Units

- [Stage 06, Unit 01: Daily Game Lifecycle And Live Public Activity](units/stage-06/01-daily-game-lifecycle-and-public-recap.md) - baseline implemented, with realtime/live-refresh hardening still open.

## Acceptance Criteria

- The system can identify today's global game by start-date id.
- A new game opens once per global day while prior games persist.
- The event time for a daily game can vary by day and is displayed to players in their local timezone.
- Public visitors can view player-visible gameplay activity across all daily games without signing in.
- Player-visible transcript content appears in the public live surface.
- New player-visible activity should appear without a manual page reload before Stage 06 is considered fully complete.
- Account identifiers, internal prompts, model metadata, secrets, and operator-only fields are not exposed publicly.

## Verification

- Verify the same global date resolves to the same daily game id for every user.
- Verify a new global day creates or resolves a different daily game id without deleting previous games.
- Verify unauthenticated users can read the public live activity surface.
- Verify public activity exposes only player-visible transcript fields and public character identity.
- Verify the `/live`, `/live/[gameId]`, and `/live/[gameId]/[playerId]` route hierarchy remains readable without authentication.
- Verify authenticated gameplay remains the only write path.

## Manual Steps

- Confirm the global timezone standard before broader daily lifecycle hardening.
- Confirm final navigation placement for the public live browser.

## Assumptions

- The first implementation may use a fixed global timezone standard even if event times vary randomly by day.
- Full transcript means full player-visible transcript, not system prompts, developer prompts, hidden structured facts, or operational metadata.
- End-of-day recaps remain a possible later archive layer, but they are no longer the first public visibility mechanism.
