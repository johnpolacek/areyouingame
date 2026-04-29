# Stage 05, Unit 04: First YES Connected Path, Drone, And Orb

Define the first connected-path continuation after the player initially answers YES.

Status: completed.

## Product Intent

The YES branch is not a mirror of the NO/unconnected continuation. A YES answer starts a distinct physical and canonical path: the player has accepted connection, a drone-delivered package may arrive within roughly one hour, the package contains a smooth orb, and the orb instruction can move the player toward becoming connected.

This unit should design and implement the first playable connected-path spine without forcing all connected-state complexity into the NO-focused first continuation. The immediate aftermath of YES may still feel much like ordinary reality at first: nothing happens right away, the world resumes, and only then does the drone/package/orb path begin to escalate. The player should feel the consequences of having accepted something real before the system expands into full connected cognition, coordination, or ASI-mediated capability.

Clarified product direction: the YES branch initially shares the same early-world feel as NO. For the first few moves, nothing directly physical happens to the player. The global takeover of screens, audio, internet services, and phone lines dominates public attention; speculation accelerates; YES players are likely in the minority and may wonder what their answer changed. Drone and package reports should only become personally actionable after that waiting period unless the player takes a drastic action that plausibly disrupts delivery.

## Scope

- Add a YES-specific continuation path after a final YES decision.
- Model the first connected-path state transitions for drone delivery, package presence, orb discovery, and orb instruction.
- Generate or assemble grounded narration for the player's first YES-path action through the existing AI SDK boundary.
- Ground the narration in player context, daily game context, opening scene context, first YES decision, first YES consequence, and Day 1 global storyline context.
- Persist connected-path state so refreshes and duplicate submissions are stable.
- Append event-history records for meaningful YES-path transitions.
- Render the YES branch under the large selected `YES` heading with a compact transcript and next action textarea.
- Preserve the physicality and timing of the drone/package/orb path without prematurely simulating full connected cognition.
- Let the first YES continuation proceed through the waiting period, deterministic package delivery eligibility, and optional unboxing into orb reveal.

## Out Of Scope

- NO/unconnected social-feed investigation, which belongs to Stage 05 Unit 03.
- Full connected hive-mind cognition, shared awareness, or advanced ASI interface design.
- Later branch switching, including NO players switching to YES, YES players destroying or rejecting the orb, and any resulting rejected/disconnected category.
- Complete drone logistics simulation for all locations.
- Real device, geolocation, delivery, camera, map, or notification integrations.
- Full global MUD engine breadth.
- Public recap generation.
- S3 narrative-memory bundles beyond preserving later artifact boundaries.

## Acceptance Criteria

- A player who has submitted an initial YES choice enters a YES-specific continuation path.
- YES players are not routed through the NO/unconnected public-feed continuation as the default path.
- The system can represent whether the drone/package/orb state is pending, arrived, opened, or acted on.
- The first YES-path response is grounded in the player's immediate context and Day 1 storyline context.
- Refreshes preserve the same connected-path state and response.
- Duplicate submissions do not create multiple drone/package/orb arrivals for the same player/day.
- Event history records meaningful YES-path transitions separately from player-facing narrative prose.
- The UI keeps the large selected `YES` heading for this unit and renders a compact transcript underneath.
- The UI does not expose delivery/orb status chips; structured state remains backend-owned while the player sees prose and the open action form.

## Data And State Notes

- Convex owns hot connected-path state, idempotency, and event history.
- Suggested state shape may include `firstConnectedPath` or a general turn/state model with fields for delivery status, package status, orb status, player-visible facts, response text, model/source metadata, and timestamps.
- Suggested event types may include `connected_path_started`, `drone_delivery_observed`, `package_received`, `orb_revealed`, and `connected_path_turn_resolved`, but the implementation can use a narrower first event model if that better matches the schema.
- The source premise says a YES answer leads to a drone-delivered package within roughly one hour. Treat this as canonical direction, but decide in implementation how much of that hour is simulated in the first playable unit.
- Do not make model prose the source of enforceable connected state. Store physical delivery/orb state as structured Convex fields.
- Delivery is deterministic by connected-path turn count: the first two YES turns stay in the public speculation/waiting period, the third turn can receive the package unless the submitted action plausibly prevents delivery, and a later open/unbox action reveals the orb.
- The package should feel small, minimal, sleek, physical, and plausible rather than magical.
- The first YES/NO answer is an initial branch marker, not a permanent player ontology. Later units should support players changing course, including NO players switching to YES and YES players losing, destroying, refusing, or rejecting the orb in ways that may move them back toward NO/unconnected or into a distinct rejected/disconnected category.

## Implementation Notes

- Added a YES-specific `firstConnectedPath` record on the Convex player with structured delivery, package, orb, turn-count, turn transcript, and timestamp fields.
- Added a Clerk-protected first connected-path action route that loads Day 1 storyline context, computes deterministic connected-path transitions before generation, and sends those transitions to the AI SDK narrative boundary as canonical constraints.
- Added event-history support for `connected_path_started`, `connected_path_turn_resolved`, `package_received`, and `orb_revealed`, with player action text, generated response text, player-visible facts, model metadata, and structured connected-path state stored separately.
- Updated the post-choice UI so YES players keep the large selected `YES` heading, see compact transcript turns, continue acting through the same textarea, and stop at orb reveal without showing status chips.
- Preserved the NO/unconnected continuation route separately; YES players no longer hit the NO-focused first post-choice endpoint.
- Tuned YES waiting-period public-feed/news/broadcast actions to support short fictional blockquote fragments, matching the NO path transcript rendering.

## Verification

- Test unauthenticated YES-path attempts fail.
- Test users cannot access another user's connected-path state.
- Test YES-path continuation fails before a final YES decision exists.
- Test NO players cannot enter the YES connected path.
- Test drone/package/orb state is persisted and refresh-safe.
- Test duplicate submissions are idempotent.
- Test event-history records player action, generated response, and structured connected-path state separately.
- Test generated narration receives Day 1 storyline context.

## Manual Steps

- Later units should decide how NO players discover unboxing footage through public sources, how NO players can switch to YES, and what happens after a YES player places, refuses, destroys, or rejects the orb.
