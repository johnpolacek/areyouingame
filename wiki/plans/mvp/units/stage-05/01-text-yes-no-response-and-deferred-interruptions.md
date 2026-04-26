# Stage 05, Unit 01: Text YES/NO Response And Deferred Interruptions

Upgrade the `Are you in?` reveal from button-only choice submission into the first text-capable decision loop: players can click YES or NO, or type what they do, and the system classifies the text as YES, NO, or deferred.

## Product Intent

The reveal should feel like the first moment of the global text-based MUD-style experience, not a form receipt. Explicit YES/NO buttons preserve the central ritual choice, while the open textarea lets players roleplay hesitation, confusion, avoidance, or alternate actions. If they defer, the world should keep interrupting them until they answer yes or no.

## Scope

- Keep the explicit `YES` and `NO` buttons on the reveal.
- Add `What will you do?` body text under the buttons.
- Add an open textarea and `Continue` button for text responses.
- Classify typed responses as `YES`, `NO`, or `DEFERRED`.
- If classified as `YES` or `NO`, persist the final first decision exactly once and advance into the first post-choice narrative/action state.
- If classified as `DEFERRED`, keep the YES/NO decision pending, persist the attempted action, and return a short interruption that again asks for yes or no.
- Replace receipt-style post-choice UI with only the selected `YES` or `NO` heading, generated consequence text, and the next open textarea response.
- Persist the first post-choice open action so it can become the seed of the broader text-based action loop.

## Out Of Scope

- A visible `Skip` button or explicit third final choice.
- Full global MUD simulation after the first post-choice action.
- Complete canonical world-state mutation rules.
- Full append-only event model beyond the narrow reveal attempt, final first decision, and first post-choice action records.
- Voice input or actual phone/audio output implementation.
- Public recap generation.

## Acceptance Criteria

- The reveal shows explicit YES and NO buttons plus a text response area.
- Clicking YES or NO still submits a deterministic final choice without an LLM classification call.
- Text submission calls an LLM classification boundary that returns only `YES`, `NO`, or `DEFERRED`.
- Empty text submissions are rejected client-side and server-side.
- Malformed classifier output fails closed and does not submit a final choice.
- A text response clearly accepting the invitation records `YES`.
- A text response clearly refusing the invitation records `NO`.
- Ambiguous, avoidant, or action-only text records a deferred reveal attempt and leaves the final choice pending.
- Deferred examples such as calling someone, throwing the phone away, asking what is happening, or trying to ignore the message produce a new interruption that repeats the yes/no demand.
- A player cannot submit a final YES/NO decision more than once for the same player/day.
- Refreshing after a deferred attempt returns to the pending reveal with the latest interruption context visible.
- Refreshing after a final YES/NO returns to the post-choice narrative/action state.
- The post-choice screen starts with only `YES` or `NO` as the top heading from the selected choice, not administrative receipt copy.
- The post-choice state includes generated consequence text and an open textarea for the next action.

## Data And State Notes

- Keep the main decision invariant as `pending` until a final `YES` or `NO` is submitted.
- Do not add `SKIP` as a final decision value.
- Store deferred attempts separately from the final first decision.
- Store enough classifier metadata for review: input text, normalized classification, model, source, submitted timestamp, and generated interruption text.
- Store enough post-choice narrative metadata for Stage 05 expansion: selected choice, generated consequence text, model/source, and the first post-choice action text.
- Convex owns the hot transactional state for reveal attempts, final decision uniqueness, pending/submitted status, and first post-choice action persistence.
- S3 remains reserved for later stable/versioned narrative-memory bundles, recap snapshots, exports, and audit artifacts.

## Verification

- Test unauthenticated text submissions fail.
- Test users cannot submit text responses for another user's player.
- Test text submissions fail before the YES/NO reveal exists.
- Test empty and malformed text submissions fail.
- Test explicit button YES and NO paths still persist final choices.
- Test representative text YES and NO inputs persist final choices.
- Test representative deferred inputs keep the decision pending and store a deferred attempt.
- Test duplicate final decision submissions are blocked after either button or text-based final choice.
- Test refresh behavior after deferred attempt and after final choice.
- Test post-choice open action submission persists for both YES and NO branches.

## Manual Steps

- Tune the exact `What will you do?` prompt copy in the UI.
- Confirm first interruption tone examples before implementation.
- Confirm whether the first post-choice action should receive an immediate generated response in this unit or only be persisted for the next unit.
