# Stage 05, Unit 03: First NO/Unconnected Post-Choice Action Response

Continue the game after the player's first open action following a final NO decision.

Status: planned.

## Product Intent

After the player chooses NO, the game should not stop at the first post-choice textarea. The submitted action should become the first normal turn of the unconnected text-based simulation: the system adjudicates what the player tries against the Day 1 global storyline context, returns a grounded narrative response, records the meaningful action/result in durable state, and offers the next open action prompt.

This unit is explicitly NO/unconnected-first. The motivating action is: `I go to my twitter/x feed to see if anyone else just had a similar experience.` The continuation should treat this as an in-world information-seeking action by an unconnected player using ordinary public channels. The game may present simulated X-like public-feed signals, confusion, copied phrases, screenshots, platform labels, viral speculation, jokes, panic, and early pattern evidence, but it must not call, scrape, quote, or imply access to the real Twitter/X service.

The feed should feel as real as possible while staying fictional and in-world. Do not use deleted or vanishing posts as a default beat; that is not established world truth for this unit.

## Scope

- Add a continuation path for a persisted first post-choice action after a final NO decision.
- Generate the first NO/unconnected post-choice action response through the existing AI SDK boundary.
- Ground the generation in the player, daily game, Day 1 global storyline context, opening scene context, first NO choice, first consequence text, and submitted action.
- Handle the social-feed example as the primary supported action shape.
- Render the generated response under the selected `NO` heading in a compact transcript, followed by the next open action textarea.
- For social-feed investigation actions, render an X-like simulated feed panel when structured feed items are available.
- Persist the generated response so refreshes return to the same continuation state.
- Append an append-only event-history record for the resolved turn.
- Store enough structured state to support later canonical world/memory expansion without making narrative copy the source of enforceable truth.
- Show a retryable error message if generation fails; do not persist an unresolved or fallback-resolved turn.

## Out Of Scope

- The YES/connected branch after the first decision, including drone delivery, package, orb, and connected-state transitions. That belongs to Stage 05 Unit 04.
- Real Twitter/X API access, browser automation, scraping, embedded live widgets, or external social-network data.
- A full social-feed product surface beyond a compact simulated in-world panel.
- Deleted, disappearing, or vanishing posts as a default event.
- A general-purpose multi-turn MUD engine beyond the first NO/unconnected continuation.
- Day 1 global storyline context definition, which belongs to Stage 05 Unit 02.
- Complete global world-state simulation.
- Public recap generation.
- S3 narrative-memory bundles, except for preserving the boundary that S3 will later own approved/versioned artifacts.
- Deterministic fallback copy for generation failure.

## Acceptance Criteria

- A player who has submitted a final NO choice and first post-choice action can continue past the current screen.
- A player who has submitted a final YES choice is not routed through this NO/unconnected continuation path.
- The exact motivating action, `I go to my twitter/x feed to see if anyone else just had a similar experience.`, produces an in-world response rather than a dead end.
- The response is grounded in the NO branch consequence when the player refused the invitation.
- The response is grounded in the Day 1 global storyline context, including the current phase, public reports, rumors, and player-visible knowledge.
- The generated continuation is persisted and refresh-safe.
- Duplicate submissions or refreshes do not generate multiple different responses for the same first post-choice action.
- The response is shown in a compact transcript under the large selected `NO` heading.
- The transcript is followed by the next open action textarea so play can continue.
- Social-feed investigation responses can include an X-like simulated feed panel with fictional posts.
- Simulated feed UI does not imply the app fetched real posts or contacted Twitter/X.
- The system records an append-only event for the submitted action and generated result.
- The event record distinguishes player-authored action text from model-authored narrative response.
- The event record includes structured player-visible facts separately from narrative prose.
- If generation fails, no fallback response is persisted; the UI shows a retryable error message.

## Data And State Notes

- Convex owns the hot transactional state for the first NO/unconnected post-choice action response, idempotency, event history, and next-action readiness.
- Prefer evolving `firstPostChoiceAction` into a resolved first-turn shape or introducing a narrow `firstPostChoiceTurn` shape with action text, response text, response model/source, action kind, player-visible facts, optional simulated feed items, and timestamps.
- Add a narrow append-only `gameplayEvents` model if one does not already exist.
- Preferred first event type: `post_choice_turn_resolved`.
- Event shape should include daily game id, player id, user id, event type, source turn id, player action text, generated response text, selected YES/NO choice, action kind, structured player-visible facts, model/source metadata, relevant context/source versions, and timestamps.
- Canonical structured state should capture only durable facts needed by later turns, such as the player checking a simulated public feed and seeing early reports of similar experiences. Do not make the prose response itself the authoritative state.
- For the social-feed action, optional structured feed items may include fictional display names, handles, timestamps, post text, reply/repost/like-style counts, and platform-style labels. These are simulated in-world artifacts, not real external content.
- Use the Stage 05 Unit 02 Day 1 context as input rather than hard-coding global storyline details directly in this unit.
- S3 remains reserved for later approved narrative-memory bundles, recap snapshots, exports, and audit artifacts.

## Verification

- Test unauthenticated continuation attempts fail.
- Test users cannot continue another user's player state.
- Test continuation fails before a final YES/NO decision exists.
- Test this NO/unconnected continuation rejects or defers YES players rather than treating them as unconnected.
- Test continuation fails before a first post-choice action exists if generation is split from submission.
- Test the NO + Twitter/X-feed example produces and persists a response.
- Test the response path receives Day 1 global storyline context.
- Test refresh after generation returns the same response and does not call the model again.
- Test duplicate submissions for the same first post-choice action are idempotent.
- Test generation failure does not persist fallback copy and shows a retryable error message.
- Test event-history records preserve player action text separately from generated response text.
- Test structured player-visible facts are stored separately from narrative prose.
- Test simulated feed rendering does not include real Twitter/X embed scripts, API calls, or live external content.

## Manual Steps

- Tune the first simulated X-like feed response tone so it feels public, messy, credible, and uncanny without pretending to be a real scrape.
- Decide whether the simulated feed panel should look closest to modern X, a legally safer generic microblog UI, or a subtly altered in-world public-feed surface.
- Confirm whether the first implementation should store simulated feed items generated by the model, deterministic feed items assembled from Day 1 context, or a hybrid of both.
