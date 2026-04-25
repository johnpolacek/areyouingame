# Stage 05, Unit 01: First Private Game Chat Opening

Start the private player-to-game chat with the shared-time location/activity question.

## Product Intent

The player should feel they have entered today's world before the core choice appears. The first prompt uses their name, the shared daily game start rendered in their local timezone, and their location: `Hi John, it is <game-time-start> in <player-location>. Where are you and what are you doing?`

## Scope

- Gate chat access to authenticated users with a player for the selected daily game.
- Create or load a private chat thread scoped to user, player, and daily game.
- Generate or assemble the first game prompt from the daily game and player context.
- Render the shared daily game start in the player's local timezone.
- Capture the player's location/activity response as the beginning of their game path.
- Explain that private play may affect end-of-day public results or summaries.

## Out Of Scope

- Full deterministic adjudication.
- Full LLM action-classification pipeline.
- Public recap generation.
- Publishing raw private chat.
- Asking YES or NO during player creation.
- Revealing the YES or NO choice in the first location/activity prompt.

## Acceptance Criteria

- Users without auth cannot access chat.
- Authenticated users without a player for the selected daily game are routed to player creation.
- The first prompt is only sent after player creation.
- The first prompt includes the player's name, local game-start time, and location.
- The first prompt asks: `Where are you and what are you doing?`
- The player's response is stored in the daily game chat context.
- The UI states that chat is private during the day and public output is summarized at end of day.

## Data And State Notes

- Chat messages should be scoped to daily game id, player id, and user id.
- The first response should be available to later logic as the player's initial scene context, without requiring it to be collected in the profile.
- Raw private chat should not be treated as public recap content by default.

## Verification

- Test chat route access for unauthenticated, authenticated-without-player, and authenticated-with-player states.
- Test the first prompt appears once and is not duplicated on refresh.
- Test the shared game start renders in the player's local timezone.
- Test the first player response persists.

## Manual Steps

- Confirm when the later `Are you in?` reveal should occur after the opening response.
- Confirm whether the first implementation should use a deterministic prompt template before connecting the LLM.
