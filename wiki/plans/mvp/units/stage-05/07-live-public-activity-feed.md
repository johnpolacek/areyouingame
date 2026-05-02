# Stage 05, Unit 07: Live Public Activity Feed

Expose player-visible Day 1 activity publicly while the first complete playable loop is still fresh, before broader recurring daily lifecycle work begins.

Status: completed.

## Product Intent

The first Day 1 loop should not only work for a signed-in player. It should also be watchable. Public observers can see active games, public player identity, and player-visible transcript beats without authentication, while all play and mutation paths remain authenticated.

This belongs to Stage 05 because it validates the core social loop of Day 1: a player joins, chooses YES or NO, takes a first real action, receives an AI response, and public observers can watch those visible consequences appear.

## Scope

- Implement a public `/live` surface that is readable without authentication.
- Implement public game-room and public player-transcript routes under `/live/[gameId]` and `/live/[gameId]/[playerId]`.
- Store public activity records and public player/character snapshots separate from internal operator event history.
- Expose player-visible prompts, player inputs, YES/NO choices, narrator responses, scene titles, branch/status labels, timestamps, daily game id, and public character identity.
- Keep account identifiers, system/developer prompts, hidden structured facts, model metadata, secrets, token/cost data, and operator-only fields private.
- Preserve authenticated gameplay as the only write path.

## Out Of Scope

- Recurring daily game creation, accumulated game lifecycle, and date-id rollover behavior.
- End-of-day recap/archive generation.
- Advanced archive search or filtering.
- Moderation queues, approval workflows, or redaction passes for v1.

## Acceptance Criteria

- Unauthenticated visitors can view public live game rooms.
- Unauthenticated visitors can open a daily game room and see public player cards.
- Unauthenticated visitors can open a public player transcript.
- Public transcript content matches what the player saw or submitted.
- Public character identity includes character name, broad location, and occupation.
- Public payloads do not include account identifiers, internal prompts, hidden state facts, model metadata, secrets, token/cost data, or operator-only fields.
- Authenticated gameplay remains the only mutation path.

## Implementation Notes

- Added public live routes: `/live`, `/live/[gameId]`, and `/live/[gameId]/[playerId]`.
- Added `lib/live-browser.ts` as the Next.js query adapter for public live game summaries, public players for a game, and public player transcript views.
- Added Convex public query helpers for live game summaries, live player summaries, and a public live player view with `clerkUserId` omitted.
- Public player transcript pages assemble opening response, opening context, reveal, decision, reveal text responses, NO post-choice turns, YES connected-path turns, orb decision turns, and connected ASI turns from stored player state.
- Gameplay mutations insert public activity records as player-visible events are created.
- Recent UI polish removed the always-visible current-status panel and action textarea placeholder copy from the active game surface; structured state still exists but is not rendered as a separate status block.

## Verification

- Test unauthenticated public live activity access.
- Test public live route access without authentication.
- Test public player transcript assembly for all current Day 1 turn types.
- Test public payload allowlists so internal-only fields cannot leak.
- Test authenticated join/play remains the only mutation path.
- Follow-up hardening may add realtime appearance checks for new public transcript events.
