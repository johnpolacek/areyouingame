# Stage 05, Unit 03: First NO/Unconnected Post-Choice Action Response

Continue the game after the player's first open action following a final NO decision.

Status: completed.

## Product Intent

After the player chooses NO, the game should not stop at the first post-choice textarea. The submitted action should become the first normal turn of the unconnected text-based simulation: the system adjudicates what the player tries against the Day 1 global storyline context, returns a grounded narrative response, records the meaningful action/result in durable state, and offers the next open action prompt.

This unit is explicitly NO/unconnected-first. The motivating action is: `I go to my twitter/x feed to see if anyone else just had a similar experience.` The continuation should treat this as an in-world information-seeking action by an unconnected player using ordinary public channels. The prompt can provide fixed Day 1 media context for surfaces such as Twitter/X, Bluesky, news feeds, Facebook, news broadcasts, and the generic public web when that context matches the player's action, but it must not call, scrape, quote, or imply access to real external services.

Media context should be source material for the LLM, not a custom rendered feed UI in this unit. The response prose should match the player's language: if they say Twitter/X, the narration can say Twitter/X; if they say Bluesky, news feed, Facebook, or news broadcast, the response should use that surface. At first there may be little or nothing useful because people need a minute or two to recover, screenshot, type, and post; then the trickle should quickly become a firehose. Do not use deleted or vanishing posts as a default beat; that is not established world truth for this unit.

## Scope

- Add a continuation path for a persisted first post-choice action after a final NO decision.
- Generate the first NO/unconnected post-choice action response through the existing AI SDK boundary.
- Ground the generation in the player, daily game, Day 1 global storyline context, opening scene context, first NO choice, first consequence text, and submitted action.
- Handle the social-feed example as the primary supported action shape.
- Render the generated response under the selected `NO` heading in a compact transcript, followed by the next open action textarea.
- Provide fixed Day 1 media context to the LLM for relevant feed, public-web, or broadcast actions.
- Keep the response open-world: players may attempt anything, and the LLM should adjudicate the action against directives and context even when no canned media context applies.
- Support short fictional post/broadcast fragments in the generated prose and render quote-prefixed paragraphs as blockquotes.
- Persist the generated response so refreshes return to the same continuation state.
- Append an append-only event-history record for the resolved turn.
- Store enough structured state to support later canonical world/memory expansion without making narrative copy the source of enforceable truth.
- Show a retryable error message if generation fails; do not persist an unresolved or fallback-resolved turn.

## Out Of Scope

- The YES/connected branch after the first decision, including drone delivery, package, orb, and connected-state transitions. That belongs to Stage 05 Unit 04.
- Real Twitter/X API access, browser automation, scraping, embedded live widgets, or external social-network data.
- A custom social-feed product surface or X-like UI panel.
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
- Relevant media-investigation responses use fixed Day 1 media context as prompt source material rather than live external data.
- The UI does not imply the app fetched real posts or contacted Twitter/X, Bluesky, Facebook, news sites, or broadcasts.
- The system records an append-only event for the submitted action and generated result.
- The event record distinguishes player-authored action text from model-authored narrative response.
- The event record includes structured player-visible facts separately from narrative prose.
- Structured player-visible facts are stored for future turns and event history, but are not rendered as a separate player-facing list below the transcript.
- If generation fails, no fallback response is persisted; the UI shows a retryable error message.

## Data And State Notes

- Convex owns the hot transactional state for the first NO/unconnected post-choice action response, idempotency, event history, and next-action readiness.
- Prefer evolving `firstPostChoiceAction` into a resolved first-turn shape or introducing a narrow `firstPostChoiceTurn` shape with action text, response text, response model/source, a broad action kind, player-visible facts, and timestamps.
- Add a narrow append-only `gameplayEvents` model if one does not already exist.
- Preferred first event type: `post_choice_turn_resolved`.
- Event shape should include daily game id, player id, user id, event type, source turn id, player action text, generated response text, selected YES/NO choice, action kind, structured player-visible facts, model/source metadata, relevant context/source versions, and timestamps.
- Canonical structured state should capture only durable facts needed by later turns, such as the player checking a simulated public feed and seeing early reports of similar experiences. Do not make the prose response itself the authoritative state.
- Fixed media context may include source snippets for Twitter/X, Bluesky, news feeds, Facebook, news broadcasts, and generic public web. The LLM should paraphrase or selectively evoke this material rather than dumping fixture text.
- Use the Stage 05 Unit 02 Day 1 context as input rather than hard-coding global storyline details directly in this unit.
- S3 remains reserved for later approved narrative-memory bundles, recap snapshots, exports, and audit artifacts.

## Implementation Notes

- Added optional resolved-turn fields to the existing Convex `firstPostChoiceAction` shape so old action-only records remain schema-compatible while new submissions persist response text, model/source metadata, action kind, player-visible facts, Day 1 context version, and resolution timestamp.
- Added a narrow append-only `gameplayEvents` table and first event type, `post_choice_turn_resolved`, for the first resolved NO/unconnected turn.
- Added an AI SDK generation boundary for the first NO post-choice response that receives player context, Day 1 storyline context, and fixed Day 1 media source material for relevant public-feed, social, news, and broadcast actions.
- Updated the protected first post-choice action route so generation succeeds before Convex state is mutated. Generation failure returns a retryable error and does not persist fallback copy.
- Updated the post-choice UI to keep the large selected `NO` heading, render a compact transcript with the submitted action and generated response, render quote-prefixed generated paragraphs as blockquotes, and show a quiet disabled next-action textarea.
- Removed the separate player-facing display of structured player-visible facts; those facts remain stored for event history and later turn context.
- YES players are not routed through this NO-focused continuation. The YES path remains planned separately in Stage 05 Unit 04.

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
- Test the implementation does not include real social embed scripts, API calls, or live external content.

## Manual Steps

- Tune the first media-investigation response tone so it feels public, messy, credible, and uncanny without pretending to be a real scrape.
- Confirm whether later units should add custom feed/news UI once the prose-first continuation works.
