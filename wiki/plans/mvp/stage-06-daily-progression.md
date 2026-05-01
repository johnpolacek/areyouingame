# Stage 06: Daily Game Lifecycle And Live Public Activity

## Stage Goal

Plan, then later implement, the global daily game lifecycle with live public gameplay visibility from the beginning: one new persistent game opens per global day, each game receives a start-date id, active games accumulate over time, and anyone can view player-visible activity across all games while it happens.

## Current Status

Planned product-spine stage. The current update is documentation-only planning; it does not implement public live activity, create routes, change schemas, or alter runtime behavior.

## Scope

- Include: daily game creation, global event timing, active/archive status, realtime public activity viewing, public transcript event planning, and player continuity across daily games.
- Exclude: detailed LLM adjudication internals, moderation tooling, and implementation work in this docs-only revision.

## Units

- [Stage 06, Unit 01: Daily Game Lifecycle And Live Public Activity](units/stage-06/01-daily-game-lifecycle-and-public-recap.md) - planned.

## Acceptance Criteria

- The system can identify today's global game by start-date id.
- A new game opens once per global day while prior games persist.
- The event time for a daily game can vary by day and is displayed to players in their local timezone.
- Public visitors can view player-visible gameplay activity across all daily games without signing in.
- Player-visible transcript content appears in the public live surface in realtime.
- Account identifiers, internal prompts, model metadata, secrets, and operator-only fields are not exposed publicly.

## Verification

- Verify the same global date resolves to the same daily game id for every user.
- Verify a new global day creates or resolves a different daily game id without deleting previous games.
- Verify unauthenticated users can read the public live activity surface.
- Verify public activity exposes only player-visible transcript fields and public character identity.
- Verify authenticated gameplay remains the only write path.

## Manual Steps

- Confirm the global timezone standard before implementation.
- Confirm the public live activity route and navigation placement before implementation.

## Assumptions

- The first implementation may use a fixed global timezone standard even if event times vary randomly by day.
- Full transcript means full player-visible transcript, not system prompts, developer prompts, hidden structured facts, or operational metadata.
- End-of-day recaps remain a possible later archive layer, but they are no longer the first public visibility mechanism.
