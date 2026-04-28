# Stage 05, Unit 03: First Post-Choice Action Response

Continue the game after the player's first open action following the initial YES/NO decision.

Status: planned.

## Product Intent

After the player chooses YES or NO, the game should not stop at the first post-choice textarea. The submitted action should become the first normal turn of the text-based simulation: the system adjudicates what the player tries against the Day 1 global storyline context, returns a grounded narrative response, records the meaningful action/result in durable state, and offers the next open action prompt.

The motivating example is the NO branch where the player enters: `I go to my twitter/x feed to see if anyone else just had a similar experience.` The continuation should treat this as an in-world information-seeking action. The game may present fictional social-feed signals, public confusion, copied phrases, deleted posts, or early pattern evidence, but it must not call or scrape the real Twitter/X service in this unit.

## Scope

- Add a continuation path for a persisted first post-choice action.
- Generate the first post-choice action response through the existing AI SDK boundary, with a deterministic fallback.
- Ground the generation in the player, daily game, Day 1 global storyline context, opening scene context, first YES/NO choice, first consequence text, and submitted action.
- Handle the social-feed example as a supported action shape, especially after the NO choice.
- Persist the generated response so refreshes return to the same continuation state.
- Render the generated response under the selected `YES` or `NO` branch and show the next open action textarea.
- Append a minimal event-history record for the player action and adjudicated response.
- Store enough structured state to support later canonical world/memory expansion without making narrative copy the source of enforceable truth.

## Out Of Scope

- Real Twitter/X API access, browser automation, scraping, or external social-network data.
- A full social-feed product surface.
- A general-purpose multi-turn MUD engine beyond the first post-choice continuation.
- Day 1 global storyline context definition, which belongs to Stage 05 Unit 02.
- Complete global world-state simulation.
- Public recap generation.
- S3 narrative-memory bundles, except for preserving the boundary that S3 will later own approved/versioned artifacts.

## Acceptance Criteria

- A player who has submitted a final YES/NO choice and first post-choice action can continue past the current screen.
- The exact motivating action, `I go to my twitter/x feed to see if anyone else just had a similar experience.`, produces an in-world response rather than a dead end.
- The response is grounded in the selected choice, including the NO branch consequence when the player refused the invitation.
- The response is grounded in the Day 1 global storyline context, including the current phase, public reports, rumors, and player-visible knowledge.
- The generated continuation is persisted and refresh-safe.
- Duplicate submissions or refreshes do not generate multiple different responses for the same first post-choice action.
- The response is followed by the next open action textarea so play can continue.
- The system records an append-only event for the submitted action and generated result.
- The event record distinguishes player-authored action text from model-authored narrative response.
- The implementation does not contact real Twitter/X or imply that real external posts were fetched.
- Fallback copy exists for generation failure and preserves the same state transition.

## Data And State Notes

- Convex owns the hot transactional state for the first post-choice action response, idempotency, event history, and next-action readiness.
- Add a narrow event model if one does not already exist; keep it append-only and scoped to meaningful gameplay transitions.
- Suggested event shape: daily game id, player id, user id, event type, source action id or turn id, player action text, generated response text, selected YES/NO choice, model/source metadata, and timestamps.
- Suggested first event types: `post_choice_action_submitted` and `post_choice_response_generated`, or a single combined `post_choice_turn_resolved` if that better matches the existing schema.
- Canonical structured state should capture only durable facts needed by later turns, such as the player checking a public feed and seeing early reports of similar experiences. Do not make the prose response itself the authoritative state.
- Use the Stage 05 Unit 02 Day 1 context as input rather than hard-coding global storyline details directly in this unit.
- S3 remains reserved for later approved narrative-memory bundles, recap snapshots, exports, and audit artifacts.

## Verification

- Test unauthenticated continuation attempts fail.
- Test users cannot continue another user's player state.
- Test continuation fails before a final YES/NO decision exists.
- Test continuation fails before a first post-choice action exists.
- Test the NO + Twitter/X-feed example produces and persists a response.
- Test the response path receives Day 1 global storyline context.
- Test refresh after generation returns the same response and does not call the model again.
- Test duplicate submissions for the same first post-choice action are idempotent.
- Test a generation failure stores deterministic fallback copy and still advances to the next action prompt.
- Test event-history records preserve player action text separately from generated response text.

## Manual Steps

- Tune the first social-feed response tone so it feels uncanny and public without becoming a fake real-world scrape.
- Confirm whether the UI should continue to use the large selected `YES`/`NO` heading for the first continuation, or shift into a normal chat/action transcript after this unit.
- Confirm the exact event-type names before implementation if the schema does not already establish them.
