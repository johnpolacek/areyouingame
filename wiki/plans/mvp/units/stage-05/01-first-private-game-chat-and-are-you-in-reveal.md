# Stage 05, Unit 01: First Private Game Chat And Are You In Reveal

Start the private player-to-game chat and reveal the central `Are you in?` choice at the end of the first game prompt.

## Product Intent

The player should feel they have entered today's world before the core choice appears. The first prompt uses their player details, what they were doing when the event happened, and the day's event timing. Only then does the game reveal the ASI question.

## Scope

- Gate chat access to authenticated users with a player for the selected daily game.
- Create or load a private chat thread scoped to user, player, and daily game.
- Generate or assemble the first game prompt from the daily game and player context.
- End the first game prompt with the surprise `Are you in?` choice.
- Capture the player's first response as the beginning of their game path.
- Explain that private play may affect end-of-day public results or summaries.

## Out Of Scope

- Full deterministic adjudication.
- Full LLM action-classification pipeline.
- Public recap generation.
- Publishing raw private chat.
- Asking YES or NO during player creation.

## Acceptance Criteria

- Users without auth cannot access chat.
- Authenticated users without a player for the selected daily game are routed to player creation.
- The first prompt is only sent after player creation.
- The first prompt includes player/day context and ends with the `Are you in?` reveal.
- The player's response is stored in the daily game chat context.
- The UI states that chat is private during the day and public output is summarized at end of day.

## Data And State Notes

- Chat messages should be scoped to daily game id, player id, and user id.
- The first response should be available to later logic as the player's initial path choice, without requiring the choice to be collected in the profile.
- Raw private chat should not be treated as public recap content by default.

## Verification

- Test chat route access for unauthenticated, authenticated-without-player, and authenticated-with-player states.
- Test the first prompt appears once and is not duplicated on refresh.
- Test the reveal appears at the end of the first prompt.
- Test the first player response persists.

## Manual Steps

- Confirm the exact first prompt copy and whether the first answer must be strictly YES/NO.
- Confirm whether the first implementation should use a deterministic prompt template before connecting the LLM.
