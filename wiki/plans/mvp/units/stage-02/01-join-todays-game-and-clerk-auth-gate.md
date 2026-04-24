# Stage 02, Unit 01: Join Today's Game And Clerk Auth Gate

Create the public entry point for today's daily game and gate actual joining behind Clerk authentication.

## Product Intent

Anyone can see that today's game exists and choose `Join Today's Game`. If they are not signed in, that action prompts them to create an account or sign in through Clerk. Account identity must exist before any player record is created.

## Scope

- Add a public `Join Today's Game` entry path.
- Resolve today's game using the global daily game id based on the game's start date.
- Add Clerk as the account/authentication boundary for joining.
- Prompt unauthenticated users to sign in or create an account before player creation.
- Route authenticated users without today's player to the player creation form.
- Route authenticated users with today's player to today's private game chat.
- Communicate that chat is private during the day and end-of-day results become publicly visible.

## Out Of Scope

- Player profile form fields beyond routing to the form.
- YES or NO choice reveal.
- Chat implementation.
- End-of-day recap generation.
- Archive browsing beyond any minimal link or placeholder needed by navigation.

## Acceptance Criteria

- Public users can see and activate `Join Today's Game`.
- Unauthenticated users cannot create a player or enter chat.
- Unauthenticated join attempts open or route to Clerk sign-in/sign-up.
- Authenticated users are routed based on whether they already have a player for today's game.
- Today's game id is stable for the same global start date.
- The UI copy establishes that participation is private during the day and summarized publicly at the end of the day.

## Data And State Notes

- `dailyGames` should include a stable start-date id, global event time, status, and timestamps.
- `players` should link one Clerk user id to one daily game id.
- The uniqueness rule is one player per authenticated user per daily game.

## Verification

- Test unauthenticated `Join Today's Game` routes to Clerk auth.
- Test authenticated user without today's player routes to player creation.
- Test authenticated user with today's player routes to chat.
- Test duplicate player prevention can be enforced by the data model in the next unit.

## Manual Steps

- Confirm enabled Clerk sign-in methods before implementation.
- Confirm the global timezone standard for daily game ids before implementation.
