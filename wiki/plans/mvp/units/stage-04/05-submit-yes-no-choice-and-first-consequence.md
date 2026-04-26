# Stage 04, Unit 05: Submit YES/NO Choice And First Consequence

Persist the player's central YES or NO decision and show the first immediate consequence state without expanding into full world simulation.

Status: completed.

## Product Intent

After the reveal asks `Are you in?`, the player needs a decisive moment that feels accepted by the game. The system should record the choice exactly once for the player/day, acknowledge it in the interface, and show a short first consequence that makes the decision feel real while preserving deeper world simulation and narrative memory work for Stage 05.

## Scope

- Capture the player's `YES` or `NO` choice from the reveal screen.
- Persist the choice against user id, player id, and daily game id.
- Prevent duplicate or changed choices without an explicit reset path.
- Advance the player from `YES/NO pending` to `first choice submitted`.
- Show an immediate post-choice consequence state for both YES and NO.
- Store a simple durable first-decision record in the production backend that Stage 05 can later expand into deeper canonical state and event history.
- Keep the immediate consequence concise and deterministic for the first implementation.

## Out Of Scope

- Full consequence simulation after the choice.
- Long-term player powers, affiliations, or world-state mutation.
- Full append-only event schema design beyond the simple first-decision record.
- Narrative memory updates.
- Public recap generation.
- Voice input implementation for verbal YES/NO.
- Letting players change their YES/NO decision after submission.

## Acceptance Criteria

- The player can submit either `YES` or `NO` from the reveal screen.
- Submitting a choice persists the selected value for the authenticated user, player, and daily game.
- The server route verifies Clerk auth and player ownership before saving the choice.
- Empty, malformed, or non-YES/NO choices are rejected server-side.
- A player cannot submit more than one choice for the same player/day.
- Refreshing after submission returns the player to the post-choice consequence state, not the reveal prompt.
- The YES consequence and NO consequence are distinct.
- The immediate consequence does not claim broad world changes that require Stage 05 canonical state.
- The UI communicates that the choice has been recorded for today's game.

## Data And State Notes

- Reuse the reveal state from Stage 04 Unit 03 as the prerequisite for submitting the choice.
- Store the normalized decision as `YES` or `NO`.
- Store enough metadata for later canonicalization: user id, player id, daily game id, submitted timestamp, and the reveal/version context if available.
- Treat this as a narrow bridge record on top of the production backend until Stage 05 expands authoritative world state, append-only events, and narrative memory.
- Start with deterministic consequence copy so the first implementation does not require another model call.

## Verification

- Test unauthenticated choice submissions fail.
- Test users cannot submit a choice for another user's player.
- Test invalid choice payloads fail.
- Test duplicate submissions are blocked.
- Test successful YES submission persists and reloads to the YES consequence.
- Test successful NO submission persists and reloads to the NO consequence.
- Test players who have not reached the reveal cannot submit a choice.

## Manual Steps

- Confirm the exact first-response copy for YES and NO before implementation if product tone needs another pass.
- Confirm whether an admin/dev reset path is needed for local testing before implementation.
