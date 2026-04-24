# Stage 03: Daily Game Entry, Auth, And Player Creation

## Stage Goal

Build the first playable entry path: a public `Join Today's Game` action, Clerk authentication, and one-per-user-per-day player creation before the first private game chat.

## Current Status

Planned product-spine stage.

## Scope

- Include: public daily-game entry, auth gating, account sign-in or creation, today's game resolution, and daily player creation.
- Exclude: revealing the YES or NO choice before chat, natural-language adjudication, public end-of-day recap generation, and multi-game archive browsing beyond links needed for entry.

## Units

- [Stage 03, Unit 01: Join Today's Game And Clerk Auth Gate](units/stage-03/01-join-todays-game-and-clerk-auth-gate.md) - planned.
- [Stage 03, Unit 02: Daily Player Creation Form](units/stage-03/02-daily-player-creation-form.md) - planned.

## Acceptance Criteria

- The homepage or entry surface presents `Join Today's Game` publicly.
- Users who are not signed in are prompted to create an account or sign in through Clerk before joining.
- Authenticated users can create exactly one player for the current daily game.
- The player form collects name, age, location, occupation, bio, and what the player is doing at the event moment adjusted to their timezone.
- The YES or NO choice is not shown during entry or player creation.
- Once the player exists, the user can proceed into the first private game chat.

## Verification

- Verify public users can see the join action but cannot create a player before Clerk auth.
- Verify player creation is scoped to the current daily game id.
- Verify duplicate player creation is blocked for the same authenticated user and daily game.
- Verify copy explains that the chat is private during the day and end-of-day outcomes become publicly visible.

## Manual Steps

- Confirm the desired Clerk sign-in methods before implementation.
- Confirm the first supported location and timezone input behavior before implementation.

## Assumptions

- Daily game ids are based on the global start date.
- There is one newly opened daily game per global day.
- Existing daily games persist and remain available after their start day.
