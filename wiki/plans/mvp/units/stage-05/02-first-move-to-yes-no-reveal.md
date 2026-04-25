# Stage 05, Unit 02: First Move To YES/NO Reveal

Submit the player's opening location/activity response, run the first AI-mediated narration step, and end with the central YES/NO choice.

## Product Intent

After the player answers where they are and what they are doing, the game should respond as if the first contact event has arrived in that specific personal context. The response should be concise, cinematic, and deterministic enough to preserve the product spine. It ends with:

```text
A new way of being is available.
Connection. Understanding. Freedom.
Are you in?
```

The player must then choose `YES` or `NO`. If this is presented through audio, the voice should say: `Please respond yes or no`.

## Scope

- Add AI SDK as the application AI integration boundary for the first move.
- Persist the player's opening response against user id, player id, and daily game id.
- Generate or assemble the first AI narration from player profile, opening response, daily game id, and shared event time.
- Render the reveal screen with the exact YES/NO copy and two buttons.
- Treat the reveal as a state transition: opening prompt answered, reveal shown, YES/NO pending.

## Out Of Scope

- Full consequence simulation after YES/NO.
- Public recap generation.
- Voice synthesis implementation, beyond preserving the audio copy requirement.
- Complex chat history UI.

## Acceptance Criteria

- Send remains disabled until the opening response contains text.
- Submitting the opening response advances away from the opening prompt.
- The next screen ends with:
  - `A new way of being is available.`
  - `Connection. Understanding. Freedom.`
  - `Are you in?`
  - `YES` and `NO` buttons.
- The player cannot submit multiple opening responses for the same player/day without an explicit reset.
- The server route verifies Clerk auth and player ownership before generating or saving the response.

## Data And State Notes

- The first move should create durable records for the opening user message, the generated reveal narration, and the pending YES/NO decision.
- Store the reveal copy as structured state, not only as rendered UI, so the next stage can process the YES/NO choice.
- Start with a deterministic fallback reveal if AI generation fails; the exact YES/NO copy should still appear.

## Verification

- Test unauthenticated requests fail.
- Test users cannot submit a first move for another user's player.
- Test empty opening responses are rejected client-side and server-side.
- Test successful submission shows the YES/NO reveal.
- Test refresh after submission does not return the player to the opening prompt.

## Manual Steps

- Choose the AI provider path before implementation: Vercel AI Gateway or a direct provider package.
- Add required AI environment variables locally and in deployment.
- Confirm whether the first implementation streams narration or returns one complete response.
