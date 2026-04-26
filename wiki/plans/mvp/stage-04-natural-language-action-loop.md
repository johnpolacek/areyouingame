# Stage 04: First Chat And Natural Language Action Loop

## Stage Goal

Connect the player to a private game chat, begin with the shared-time location/activity prompt, and then grow the loop toward the later `Are you in?` reveal, LLM interpretation, deterministic adjudication guardrails, persisted state changes, event logging, and grounded narrative response.

## Current Status

Active product-spine stage.

## Scope

- Include: private player-to-game chat, first prompt composition, player response capture, and the first boundary between chat messages and game state.
- Exclude: player creation, public daily recap generation, and full world-simulation breadth beyond the first chat loop.

## Units

- [Stage 04, Unit 01: First Private Game Chat Opening](units/stage-04/01-first-private-game-chat-and-are-you-in-reveal.md) - completed.
- [Stage 04, Unit 02: Submit Opening Response](units/stage-04/02-submit-opening-response.md) - completed.
- [Stage 04, Unit 03: First Move To YES/NO Reveal](units/stage-04/03-first-move-to-yes-no-reveal.md) - completed.
- [Stage 04, Unit 04: Submit YES/NO Choice And First Consequence](units/stage-04/04-submit-yes-no-choice-and-first-consequence.md) - planned final Stage 04 product-spine unit.

## Acceptance Criteria

- A player who joined today's game and created their player can enter a private chat with the game.
- The first game prompt uses the player's name, local rendering of the shared event time, and player location.
- The first game prompt asks where the player is and what they are doing.
- The player's first response is submitted and stored before a later reveal ending with `A new way of being is available. Connection. Understanding. Freedom. Are you in?`
- The YES or NO choice is captured on the reveal screen, not the player creation form or first location/activity prompt.
- The selected YES or NO choice is persisted exactly once for the player/day before deeper state and memory systems are introduced.
- The interface communicates that private chat content may affect end-of-day public results or summaries.

## Verification

- Verify unauthenticated users and users without a player cannot enter the private game chat.
- Verify the first prompt is generated only after player creation.
- Verify the first prompt asks where the player is and what they are doing using the player's local game-start time.
- Verify the first response persists and advances out of the opening prompt before the YES/NO reveal screen.
- Verify the YES/NO choice persists and reloads to a post-choice consequence state.
- Verify chat records are scoped to the user, player, and daily game.

## Manual Steps

- Use direct OpenAI via AI SDK with `gpt-5.4-mini` for the first implementation.
- Confirm whether the reveal narration streams or returns as one complete response.

## Assumptions

- Chat is private during the active day.
- End-of-day public output is summarized rather than exposing raw private chat transcripts by default.
