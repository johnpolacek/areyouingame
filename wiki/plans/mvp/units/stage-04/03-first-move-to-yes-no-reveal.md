# Stage 04, Unit 03: First Move To YES/NO Reveal

Use the player's stored opening location/activity response, run the first AI-mediated narration step, and end with the central YES/NO choice.

## Product Intent

- If they have their phone nearby (most likely) it will buzz and they can open it.
- If they are watching TV, playing video games, using a computer at work, etc then there will also be a screen takeover in addition to their phone buzzing.
- If they are not near a TV or not on their phone in an area that has network connected speakers (driving, sleeping) then they will be communicated to via audio.

After the player has answered where they are and what they are doing, the game should respond as if the first contact event has arrived in that specific personal context. The response should be concise, cinematic, and deterministic enough to preserve the product spine. It ends with:

```text
A new way of being is available.
Connection. Understanding. Freedom.
Are you in?
```

The AI should write a 1-2 paragraph short intro describing the scene and how the message reaches the player. The player must then choose `YES` or `NO`. If the user is near any listening device (phone, Alexa/Google Home speakers) then they can also respond verbally. The canonical audio prompt is: `Please respond yes or no`.

## Scope

- Add AI SDK as the application AI integration boundary for the first move.
- Use the direct OpenAI provider with `gpt-5.4-mini` for the first text-generation path.
- Load the persisted opening response for the authenticated user, player, and daily game.
- Generate or assemble the first AI narration from player profile, opening response, daily game id, and shared event time.
- Generate a 1-2 paragraph scene intro describing how the first-contact message reaches the player in their current situation.
- Use the player's opening response to choose the narrative delivery mode: phone buzz, screen takeover, ambient audio, or another plausible connected-device interruption.
- Render the reveal screen with the exact YES/NO copy and two buttons.
- Treat the reveal as a state transition: opening prompt answered, reveal shown, YES/NO pending.

## Out Of Scope

- Full consequence simulation after YES/NO.
- Public recap generation.
- Real push notifications, device takeover, smart speaker integrations, or voice synthesis implementation beyond preserving the narrative/audio copy requirement.
- Complex chat history UI.

## Acceptance Criteria

- Players who have not submitted the opening response remain on the opening prompt flow.
- Players with a submitted opening response advance from the submitted state to the reveal flow.
- The next screen ends with:
  - `A new way of being is available.`
  - `Connection. Understanding. Freedom.`
  - `Are you in?`
  - `YES` and `NO` buttons.
- The AI-generated intro is 1-2 short paragraphs before the fixed YES/NO reveal.
- The intro references the player's stated location/activity without contradicting it.
- The intro may narrate phone buzzes, screen takeovers, or audio interruptions, but these are story events only in this unit.
- The fixed reveal copy is not paraphrased by the model.
- The server route verifies Clerk auth and player ownership before generating or saving reveal state.

## Data And State Notes

- The first move should create durable records for the generated reveal narration and the pending YES/NO decision, using the already-stored opening user message as input.
- Store the reveal copy as structured state, not only as rendered UI, so the next stage can process the YES/NO choice.
- Store the 1-2 paragraph scene intro separately from the fixed reveal copy so the reveal remains deterministic.
- Start with a deterministic fallback reveal if AI generation fails; the exact YES/NO copy should still appear.
- The implementation should read the model from `OPENAI_MODEL`, defaulting to `gpt-5.4-mini`.
- Audio remains a later integration because `gpt-5.4-mini` is text/image-input focused and does not directly provide audio output.

## Verification

- Test unauthenticated requests fail.
- Test users cannot submit a first move for another user's player.
- Test successful reveal generation shows the YES/NO reveal.
- Test refresh after submission does not return the player to the opening prompt.

## Manual Steps

- Add `OPENAI_API_KEY` locally and in deployment.
- Confirm whether to pin `OPENAI_MODEL=gpt-5.4-mini` explicitly in production or rely on the application default.
- Confirm whether the first implementation streams narration or returns one complete response.
