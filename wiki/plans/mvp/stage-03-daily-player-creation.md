# Stage 03: Daily Player Creation

## Stage Goal

Let an authenticated user create exactly one player for today's daily game before entering the first private game chat.

## Current Status

Planned product-spine stage.

## Scope

- Include: daily player creation, profile fields, event-time prompt context, one-player-per-user-per-day enforcement, and routing into chat after creation.
- Exclude: public entry/auth gating, revealing the YES or NO choice before chat, natural-language adjudication, public end-of-day recap generation, and multi-game archive browsing.

## Units

- [Stage 03, Unit 01: Daily Player Creation Form](units/stage-03/01-daily-player-creation-form.md) - planned.

## Acceptance Criteria

- Authenticated users can create exactly one player for the current daily game.
- The player form collects name, age, location, occupation, bio, and what the player is doing at the event moment adjusted to their timezone.
- The YES or NO choice is not shown during entry or player creation.
- Once the player exists, the user can proceed into the first private game chat.

## Verification

- Verify unauthenticated users cannot submit player creation.
- Verify player creation is scoped to the current daily game id.
- Verify duplicate player creation is blocked for the same authenticated user and daily game.
- Verify player creation routes to chat after success.

## Manual Steps

- Confirm the first supported location and timezone input behavior before implementation.

## Assumptions

- Daily game ids are based on the global start date.
- There is one newly opened daily game per global day.
- Existing daily games persist and remain available after their start day.
