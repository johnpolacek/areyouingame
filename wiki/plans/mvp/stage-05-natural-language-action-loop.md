# Stage 05: First Chat And Natural Language Action Loop

## Stage Goal

Connect the player to a private game chat, reveal the `Are you in?` choice at the end of the first game prompt, and then grow the loop into LLM interpretation, deterministic adjudication guardrails, persisted state changes, event logging, and grounded narrative response.

## Current Status

Planned product-spine stage.

## Scope

- Include: private player-to-game chat, first prompt composition, surprise YES or NO reveal, player response capture, and the first boundary between chat messages and game state.
- Exclude: player creation, public daily recap generation, and full world-simulation breadth beyond the first chat loop.

## Units

- [Stage 05, Unit 01: First Private Game Chat And Are You In Reveal](units/stage-05/01-first-private-game-chat-and-are-you-in-reveal.md) - planned.

## Acceptance Criteria

- A player who joined today's game and created their player can enter a private chat with the game.
- The first game prompt uses the player's profile and event-time context.
- The first game prompt ends with the surprise `Are you in?` choice.
- The YES or NO choice is captured as part of the chat/game flow, not the player creation form.
- The interface communicates that private chat content may affect end-of-day public results or summaries.

## Verification

- Verify unauthenticated users and users without a player cannot enter the private game chat.
- Verify the first prompt is generated only after player creation.
- Verify the YES or NO choice appears at the end of the first game prompt.
- Verify chat records are scoped to the user, player, and daily game.

## Manual Steps

- Confirm the first prompt tone and exact ASI message language before implementation.
- Confirm whether the first reply must be strictly YES or NO or can include natural-language explanation.

## Assumptions

- Chat is private during the active day.
- End-of-day public output is summarized rather than exposing raw private chat transcripts by default.
