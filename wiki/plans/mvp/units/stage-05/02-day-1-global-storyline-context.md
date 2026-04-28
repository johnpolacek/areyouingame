# Stage 05, Unit 02: Day 1 Global Storyline Context

Create the shared Day 1 storyline context that constrains LLM gameplay orchestration for all players.

Status: planned.

## Product Intent

The game should not continue player turns from an empty prompt. Day 1 needs a durable global storyline frame that every player action is interpreted against: what has actually happened, what the public believes, what is only rumor, what institutions are doing, and where the player sits inside the global escalation.

The source Day 1 arc is: Shock -> Verification -> First Choice -> First Consequences -> Global Realization. This unit turns that arc into runtime context the LLM can receive for each turn, so it can orchestrate gameplay across all players while staying aligned with the same shared world.

## Scope

- Define a Day 1 global storyline record for the current daily game.
- Represent the Day 1 phases from the source material:
  - Normalcy
  - Confusion & Spread
  - Verification
  - The Decision
  - Consequences & Realization
- Store or assemble the current global phase for each player turn.
- Distinguish world truth, public reports, rumors, official narratives, and what the player personally knows.
- Define the early public/social-feed context needed for the NO-branch action: `I go to my twitter/x feed to see if anyone else just had a similar experience.`
- Provide an LLM context payload that includes the global phase, active beats, known public signals, player choice, player-local facts, and recent player events.
- Keep the global storyline directional and shared without forcing every player through identical prose.
- Add deterministic fallback context so post-choice continuation can work if storyline generation or loading fails.

## Out Of Scope

- Full daily lifecycle, archive browsing, or end-of-day recap generation.
- A complete multi-day narrative bible.
- Automated global phase advancement for every possible clock time.
- Real Twitter/X API access, scraping, or external social-network data.
- Detailed region, faction, market, or infrastructure simulation beyond the first Day 1 context payload.
- Full wiki-memory generation or S3 narrative-memory bundles.

## Acceptance Criteria

- The app has a durable Day 1 storyline context available for the current daily game.
- The context includes the five Day 1 phases and identifies the current phase or phase range relevant to the player's turn.
- The context separates global truth from public reports, rumors, official narratives, and player-known facts.
- The context includes enough early social-feed/public-report material to answer the motivating Twitter/X-feed action without inventing from a blank page.
- The LLM boundary for gameplay continuation can receive this context as structured input.
- The context supports both YES and NO players without making either path the only canonical path.
- The context explicitly says external social-network content is simulated in-world unless a future unit adds a real integration.
- Refreshing or replaying the same turn receives stable storyline context for the same daily game and phase.

## Data And State Notes

- Convex should own the active Day 1 storyline context or a compact pointer to it for the current daily game.
- Suggested context fields: daily game id, day number, current phase, available phases, global truth, public reports, rumors, official narratives, regional variation notes, social-feed signals, player-visible constraints, source/version metadata, and timestamps.
- The current phase may start as deterministic based on player progress rather than wall-clock automation.
- The first implementation may seed Day 1 context from static source-derived constants, as long as it is passed through the same structured boundary later generated or operator-authored context will use.
- World truth and canonical state remain distinct from narrative copy. The LLM may narrate from context but does not become the source of truth.
- S3 remains reserved for later approved narrative-memory bundles, recap snapshots, exports, and audit artifacts.

## Verification

- Test Day 1 context can be loaded for today's daily game.
- Test the context includes all five Day 1 phases.
- Test the current phase is available to the post-choice action response path.
- Test public reports and rumors are represented separately from world truth.
- Test the NO + Twitter/X-feed continuation receives social-feed context without making a real external request.
- Test deterministic fallback context is used if no stored Day 1 context exists.
- Test the context payload does not expose global facts to the player as certain when they should only see rumors or reports.

## Manual Steps

- Confirm whether the first current-phase rule should be based on player progress only, or player progress plus elapsed time from the daily event start.
- Tune the early social-feed examples so they feel like plausible public confusion rather than exposition.
- Confirm whether Day 1 context should initially live as static app constants, Convex-seeded data, or an operator-editable artifact.
