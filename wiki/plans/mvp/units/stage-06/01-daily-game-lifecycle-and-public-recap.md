# Stage 06, Unit 01: Daily Game Lifecycle And Public Recap

Plan and implement the lifecycle for accumulating daily games and preserving public recap/archive continuity after the Stage 05 live feed proves the Day 1 social loop.

Status: planned.

The current app includes public live browser routes and Convex-backed public activity records from Stage 05 Unit 07. This unit should avoid re-owning that work and focus on recurring daily game lifecycle behavior.

## Product Intent

Every global day starts a new game, but prior games persist. The archive grows over time: launch day has one active game, the next day has two persisted games, and each later day adds another daily game. The Stage 05 live feed shows player-visible activity while play happens. Stage 06 makes those daily games durable, navigable, and recap-friendly after the day rolls over.

## Scope

- Resolve or create one daily game per global date.
- Assign each daily game a stable start-date id.
- Store a global event time that can vary by day.
- Display the event time to players in their local timezone where relevant.
- Track daily game status in a way that supports persistent active and historical games.
- Keep the Stage 05 public `/live` surface working as daily games accumulate.
- Define how public live pages link to older game recaps or archive pages.
- Store or resolve public recap/archive records for completed or prior daily games.
- Treat end-of-day recaps as an archive/summarization layer built from player-visible gameplay and approved durable summaries.

## Out Of Scope

- Public exposure of internal prompts, developer prompts, hidden structured facts, model metadata, token/cost data, Clerk/account identifiers, backend secrets, or operator-only audit fields.
- Moderation queues, approval workflows, or redaction passes for v1.
- Full automated world simulation for every recap.
- Advanced archive search or filtering.
- The initial public live browser and public activity feed, which belong to Stage 05 Unit 07.
- Multi-timezone daily rollover policy beyond the chosen global standard.

## Acceptance Criteria

- The same global date always resolves to the same daily game id.
- A new global day creates or resolves a new daily game without deleting older games.
- Daily games remain accessible after their start day.
- Each daily game stores an event time that can be rendered in user-local time.
- Unauthenticated visitors can browse persisted daily games and public recap/archive surfaces.
- The public archive includes prior daily games, not only today's game.
- Stage 05 public live routes remain readable without authentication after lifecycle changes.
- Public recap/archive content traces back to what players saw or submitted and approved durable summaries.
- Public payloads do not include account identifiers, internal prompts, hidden state facts, model metadata, secrets, token/cost data, or operator-only fields.

## Data And State Notes

- Daily game ids should be derived from a normalized global start date.
- Stage 05 public activity records should link to the daily game id and a stable public player/character snapshot.
- Authenticated gameplay routes remain the write boundary; public queries are read-only.
- Existing internal gameplay events should remain auditable for operators even when the public stream exposes only player-visible transcript content.
- Recap records, if added later, should link to the daily game id and preserve generated or manually approved summary content as archive material.

## Implementation Notes

- Stage 05 Unit 07 added public live routes: `/live`, `/live/[gameId]`, and `/live/[gameId]/[playerId]`.
- Stage 05 Unit 07 added `lib/live-browser.ts`, Convex public query helpers, and public activity insertion alongside gameplay mutations.
- Stage 06 should preserve those live routes while adding daily lifecycle and recap/archive behavior around them.

## Verification

- Test date-to-game-id stability.
- Test previous daily games remain after a new day starts.
- Test unauthenticated public recap/archive access.
- Test prior-game archive ordering and current-game versus prior-game navigation.
- Test public recap/archive payload allowlists so internal-only fields cannot leak.
- Test authenticated join/play remains the only mutation path.
- Regression-test public live route access without authentication.

## Manual Steps

- Confirm the global timezone standard for date ids.
- Confirm whether the event time is random within a configured window or any time in the global day.
- Confirm final navigation placement for `/live`.
