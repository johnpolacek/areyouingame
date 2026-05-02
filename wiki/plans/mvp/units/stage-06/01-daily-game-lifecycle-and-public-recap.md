# Stage 06, Unit 01: Daily Game Lifecycle And Live Public Activity

Plan and begin implementing the lifecycle for accumulating daily games and making player-visible gameplay activity public live from the beginning.

Status: baseline implemented after the original docs-only planning pass.

The current app includes public live browser routes and Convex-backed public activity records. Realtime refresh/push behavior and stricter public payload tests remain follow-up work.

## Product Intent

Every global day starts a new game, but prior games persist. The archive grows over time: launch day has one active game, the next day has two persisted games, and each later day adds another daily game. From the beginning, the game is public: anyone can view live player-visible activity across all games, while joining and playing remain authenticated.

## Scope

- Resolve or create one daily game per global date.
- Assign each daily game a stable start-date id.
- Store a global event time that can vary by day.
- Display the event time to players in their local timezone where relevant.
- Track daily game status in a way that supports persistent active and historical games.
- Implement a public `/live` surface that is readable without authentication.
- Implement public game-room and public player-transcript routes under `/live/[gameId]` and `/live/[gameId]/[playerId]`.
- Store public activity records and public player/character snapshots separate from internal operator event history.
- Plan realtime activity across all daily games, defaulting to newest activity first with grouping or filtering by daily game.
- Plan a public transcript event stream containing player-visible prompts, player inputs, YES/NO choices, narrator responses, scene titles, branch/status labels, timestamps, daily game id, and public character identity.
- Treat end-of-day recaps as a later archive/summarization layer, not the first public visibility mechanism.

## Out Of Scope

- Public exposure of internal prompts, developer prompts, hidden structured facts, model metadata, token/cost data, Clerk/account identifiers, backend secrets, or operator-only audit fields.
- Moderation queues, approval workflows, or redaction passes for v1.
- Full automated world simulation for every recap.
- Advanced archive search or filtering.
- Multi-timezone daily rollover policy beyond the chosen global standard.

## Acceptance Criteria

- The same global date always resolves to the same daily game id.
- A new global day creates or resolves a new daily game without deleting older games.
- Daily games remain accessible after their start day.
- Each daily game stores an event time that can be rendered in user-local time.
- Unauthenticated visitors can view live gameplay activity.
- The public live view includes activity from all daily games, not only today's game.
- Public live routes are readable without authentication.
- Follow-up: new player-visible activity appears without a manual page reload.
- Public transcript content matches what the player saw or submitted.
- Public character identity includes character name, broad location, and occupation.
- Public payloads do not include account identifiers, internal prompts, hidden state facts, model metadata, secrets, token/cost data, or operator-only fields.

## Data And State Notes

- Daily game ids should be derived from a normalized global start date.
- Prefer a materialized append-only public activity stream separate from operator/internal event history.
- Public activity records should link to the daily game id and a stable public player/character snapshot.
- Authenticated gameplay routes remain the write boundary; public queries are read-only.
- Existing internal gameplay events should remain auditable for operators even when the public stream exposes only player-visible transcript content.
- Recap records, if added later, should link to the daily game id and preserve generated or manually approved summary content as archive material.

## Implementation Notes

- Added public live routes: `/live`, `/live/[gameId]`, and `/live/[gameId]/[playerId]`.
- Added `lib/live-browser.ts` as the Next.js query adapter for public live game summaries, public players for a game, and public player transcript views.
- Added Convex public query helpers for live game summaries, live player summaries, and a public live player view with `clerkUserId` omitted.
- Public player transcript pages assemble opening response, opening context, reveal, decision, reveal text responses, NO post-choice turns, YES connected-path turns, orb decision turns, and connected ASI turns from stored player state.
- Gameplay mutations insert public activity records as player-visible events are created.
- Recent UI polish removed the always-visible current-status panel and action textarea placeholder copy from the active game surface; structured state still exists but is not rendered as a separate status block.

## Verification

- Test date-to-game-id stability.
- Test previous daily games remain after a new day starts.
- Test unauthenticated public live activity access.
- Test realtime appearance of new public transcript events.
- Test all-games activity ordering and per-game grouping/filtering.
- Test public payload allowlists so internal-only fields cannot leak.
- Test authenticated join/play remains the only mutation path.
- Test public live route access without authentication.
- Test public player transcript assembly for all current Day 1 turn types.

## Manual Steps

- Confirm the global timezone standard for date ids.
- Confirm whether the event time is random within a configured window or any time in the global day.
- Confirm final navigation placement for `/live`.
