# Stage 06: Daily Game Lifecycle And Recaps

## Stage Goal

Implement the global daily game lifecycle: one new persistent game opens per global day, each game receives a start-date id, active games accumulate over time, and end-of-day public recaps preserve shared outcomes.

## Current Status

Planned product-spine stage.

## Scope

- Include: daily game creation, global event timing, active/archive status, end-of-day recap creation, durable summaries, and player continuity across daily games.
- Exclude: detailed LLM adjudication internals and raw private chat publication.

## Units

- [Stage 06, Unit 01: Daily Game Lifecycle And Public Recap](units/stage-06/01-daily-game-lifecycle-and-public-recap.md) - planned.

## Acceptance Criteria

- The system can identify today's global game by start-date id.
- A new game opens once per global day while prior games persist.
- The event time for a daily game can vary by day and is displayed to players in their local timezone.
- Private daily play produces end-of-day public summary material.
- Each completed day has a durable recap/archive entry visible to everyone.

## Verification

- Verify the same global date resolves to the same daily game id for every user.
- Verify a new global day creates or resolves a different daily game id without deleting previous games.
- Verify recap visibility does not expose private raw chat by default.

## Manual Steps

- Confirm the global timezone standard before implementation.
- Confirm the archive browsing surface before implementation.

## Assumptions

- The first implementation may use a fixed global timezone standard even if event times vary randomly by day.
- End-of-day recap generation may start as manual or deterministic before full automation is added.
