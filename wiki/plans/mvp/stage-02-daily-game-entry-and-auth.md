# Stage 02: Daily Game Entry And Auth

## Stage Goal

Build the public entry path for today's daily game and gate actual joining behind Clerk authentication.

## Current Status

Completed.

## Scope

- Include: public `Join Today's Game`, today's global game resolution, Clerk sign-in or account creation, and routing authenticated users to the correct next step.
- Exclude: player creation form fields, the surprise YES or NO reveal, private chat, end-of-day recaps, and archive browsing beyond any minimal entry link.

## Units

- [Stage 02, Unit 01: Join Today's Game And Clerk Auth Gate](units/stage-02/01-join-todays-game-and-clerk-auth-gate.md) - completed.

## Acceptance Criteria

- The public entry surface presents `Join Today's Game`.
- Public visitors can understand today's game exists before authenticating.
- Users who are not signed in are prompted to create an account or sign in through Clerk before joining.
- Authenticated users without a player for today's game are routed to player creation.
- Authenticated users who already have today's player are routed to the private game chat.
- The entry flow communicates that chat is private during the day and summarized publicly at the end of the day.

## Verification

- Verify public users can see the join action.
- Verify unauthenticated users cannot create a player or enter chat.
- Verify unauthenticated join attempts route through Clerk.
- Verify authenticated routing distinguishes users with and without today's player.

## Manual Steps

- Confirm enabled Clerk sign-in methods before implementation.
- Confirm the global timezone standard for daily game ids before implementation.

## Assumptions

- Stage 01 already covered the initial executable scaffold and centered homepage.
- Daily game ids are based on the global start date.
- Account creation or sign-in happens before player creation.
