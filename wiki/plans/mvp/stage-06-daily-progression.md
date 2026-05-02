# Stage 06: Daily Game Lifecycle And Public Recap

## Stage Goal

Plan and implement the global daily game lifecycle on top of the Stage 05 live public activity feed: one new persistent game opens per global day, each game receives a start-date id, active games accumulate over time, and public recap/archive continuity makes prior daily games readable after they are no longer current.

## Current Status

Not started as a separate lifecycle stage. The first public live browser was moved into Stage 05 Unit 07 because it validates the Day 1 social loop before recurring daily lifecycle work begins.

Stage 06 should now focus on date-id daily game creation, event timing, persistence across accumulated games, return-player continuity, and public recap/archive behavior that builds on the existing `/live` surface.

## Scope

- Include: daily game creation, global event timing, active/archive status, return-player continuity across daily games, and public recap/archive continuity for persisted games.
- Exclude: the first live public activity feed, detailed LLM adjudication internals, moderation tooling, and private/operator event-history UI.

## Units

- [Stage 06, Unit 01: Daily Game Lifecycle And Public Recap](units/stage-06/01-daily-game-lifecycle-and-public-recap.md) - planned.

## Acceptance Criteria

- The system can identify today's global game by start-date id.
- A new game opens once per global day while prior games persist.
- The event time for a daily game can vary by day and is displayed to players in their local timezone.
- Public visitors can browse persisted daily games and their public recap/archive surfaces without signing in.
- Prior daily games remain readable after a new global day starts.
- Public recap/archive content is derived from player-visible gameplay and approved durable summaries, not hidden system state.
- Account identifiers, internal prompts, model metadata, secrets, and operator-only fields are not exposed publicly.

## Verification

- Verify the same global date resolves to the same daily game id for every user.
- Verify a new global day creates or resolves a different daily game id without deleting previous games.
- Verify unauthenticated users can read public recap/archive surfaces for persisted games.
- Verify public recap/archive payloads expose only player-visible transcript fields, public character identity, and approved summaries.
- Verify the Stage 05 `/live`, `/live/[gameId]`, and `/live/[gameId]/[playerId]` route hierarchy still works after daily lifecycle changes.
- Verify authenticated gameplay remains the only write path.

## Manual Steps

- Confirm the global timezone standard before broader daily lifecycle hardening.
- Confirm how public live pages link to older game recaps or archives.

## Assumptions

- The first implementation may use a fixed global timezone standard even if event times vary randomly by day.
- Full transcript means full player-visible transcript, not system prompts, developer prompts, hidden structured facts, or operational metadata.
- End-of-day recaps are an archive layer that builds on live public activity, not the first public visibility mechanism.
