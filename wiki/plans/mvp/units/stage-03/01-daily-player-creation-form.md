# Stage 03, Unit 01: Daily Player Creation Form

Create the one-per-user-per-day player form that places an authenticated user into today's game.

## Product Intent

After signing in, the user creates a player specifically for today's daily game. The player captures who they are and what they are doing at the moment of the event, but it does not reveal or ask the YES or NO `Are you in?` choice.

## Scope

- Build a player creation form for authenticated users joining today's game.
- Support the first-screen pre-auth character draft flow: users can enter character details before Clerk account creation, then claim that character after sign-up or sign-in completes.
- Collect name, age, location, occupation, bio, and what the player is doing at the time of the event.
- Display the daily event time adjusted to the user's timezone when asking what they are doing.
- Persist the player against the authenticated Clerk user id and today's game id.
- Enforce one player per user per daily game.
- Route the user into the first private game chat once the player is created.

## Out Of Scope

- Asking the YES or NO choice.
- Generating the first chat prompt.
- Editing players after creation.
- Multiple players per user per day.
- Public profile or leaderboard surfaces.

## Acceptance Criteria

- Only authenticated users can submit the form.
- The form includes fields for name, age, location, occupation, bio, and event-moment activity.
- The event-moment prompt uses the daily game event time in the user's timezone.
- Submitting creates exactly one player for the authenticated user and daily game.
- If a player already exists for that user and daily game, the user is routed to chat rather than shown a second creation form.
- No player creation UI reveals the YES or NO choice.

## Data And State Notes

- Pre-auth character data may be stored as a short-lived browser draft until Clerk returns an authenticated user.
- Store enough timezone or locale context to render the event moment consistently.
- The player record should preserve the user's event-moment activity as initial narrative context for the first prompt.
- The user account remains separate from the daily player, because a new player can be created for each new daily game.

## Implementation Notes

- The current implementation saves the first-screen character draft in `sessionStorage`, claims it from `/join` after Clerk auth, and creates a server-side player record linked to `clerkUserId + dailyGameId`.
- Until Convex is connected, local development persistence uses `.data/players.json`; this is intentionally ignored by git and should be replaced by the canonical Convex model in the next persistence-focused slice.
- Duplicate daily player creation is blocked by returning the existing player for the same Clerk user id and daily game id.

## Verification

- Test required fields and basic validation.
- Test duplicate player creation for the same user and game is blocked.
- Test a new daily game allows the same user to create a new player.
- Test the YES or NO phrase does not appear in the form flow.
- Test the post-auth draft claim path after Clerk Google/email providers are enabled.

## Manual Steps

- Confirm minimum age handling and whether age needs range validation.
- Confirm whether location should begin as free text or structured region/timezone input.
- Enable Google and email sign-up/sign-in in the Clerk Dashboard before full end-to-end auth testing.
