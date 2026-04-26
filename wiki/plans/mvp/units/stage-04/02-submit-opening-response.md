# Stage 04, Unit 02: Submit Opening Response

Persist the player's answer to `Where are you and what are you doing?` before the first AI-mediated reveal work begins.

## Product Intent

The opening prompt should behave like a real game input, not a visual placeholder. When the player sends their location/activity response, the game records it once for today's player path and moves them out of the prompt state so the next unit can generate the first contact reveal from durable context.

## Scope

- Submit the player's opening location/activity response from the first prompt.
- Persist the response against user id, player id, and daily game id.
- Prevent empty responses and duplicate opening submissions for the same player/day.
- Advance the UI away from the opening prompt after a successful send.
- Show a simple submitted state that confirms the response is recorded and previews that the first contact reveal is next.
- Preserve the response so refreshes do not return the player to the opening prompt.

## Out Of Scope

- AI-generated first contact narration.
- YES/NO reveal copy and buttons.
- YES/NO choice submission.
- Full chat history UI.
- Real push notifications, device takeover, smart speaker integrations, or voice synthesis.

## Acceptance Criteria

- Send remains disabled until the opening response contains text.
- Clicking Send submits the response through a protected server route.
- The server route verifies Clerk auth and the current daily player before saving.
- Empty opening responses are rejected client-side and server-side.
- A player cannot submit multiple opening responses for the same player/day without an explicit reset.
- Successful submission advances away from the opening prompt to a response-submitted state.
- Refresh after submission returns to the response-submitted state, not the opening prompt.

## Data And State Notes

- The backend-foundation unit migrated this state from the temporary local store to Convex before new gameplay state was added.
- Store the raw trimmed opening response and submission timestamp on the daily player record.
- The next unit should treat the stored opening response as prerequisite context for the first AI narration and YES/NO reveal.

## Verification

- Test unauthenticated requests fail.
- Test empty opening responses fail.
- Test successful submission persists and advances the UI.
- Test duplicate opening-response submissions fail.
- Test refresh after submission preserves the submitted state.

## Manual Steps

- Submit a realistic opening response from `/game/today` and confirm the page changes immediately after send.
- Reload `/game/today` and confirm the prompt does not reappear for the same player/day.
