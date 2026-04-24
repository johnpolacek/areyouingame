# Technical Brief

## Purpose

AreYouIn should be scaffolded as a persistent, AI-mediated simulation with a strict separation between canonical state, immutable history, and narrative memory. The LLM participates as a game master and narrator, not as the source of truth.

## Scaffold-Driving Defaults

- Create a project structure that can support application code, simulation logic, persistent data access, event logging, and wiki-backed memory.
- Treat the database as authoritative for current structured world state.
- Treat the event log as append-only history for meaningful world changes.
- Treat the wiki as compressed narrative memory and context.
- Keep LLM behavior behind a boundary that can receive state, classify intent, produce adjudication support, narrate outcomes, and summarize events.

## Core Runtime Loop

1. Receive player action.
2. Interpret player intent with the LLM.
3. Evaluate the action against canonical state and simulation constraints.
4. Apply database updates for accepted world changes.
5. Append an event describing meaningful outcomes.
6. Update wiki memory when the event is narratively significant.
7. Return narrated outcome to the player.

## Journey Translation

The first product journey should translate the source concept into a minimal playable loop:

- Player enters an ongoing shared world.
- Player is presented with the ASI premise and YES/NO choice.
- Player state records their path as Connected or Unconnected.
- Player submits natural language actions.
- The system adjudicates and records consequences.
- The player receives narrative feedback grounded in stored state.
- Daily progression advances world state and world memory.

## Data Boundaries

Canonical database state should cover structured entities such as players, regions, factions, world metrics, infrastructure, resources, relationships, active operations, incidents, messages, and daily snapshots as needed by the MVP.

The event log should record player actions, outcomes, major incidents, ASI interventions, faction movements, infrastructure disruptions, and global announcements.

Wiki memory should hold world timelines, regional summaries, faction descriptions, key figures, cultural shifts, narrative arcs, and daily briefings. It should not be used as the authority for numeric or enforceable state.

## LLM Boundary

The LLM may:

- Interpret natural language intent.
- Classify action type.
- Estimate plausible outcomes within constraints.
- Generate narrative responses.
- Summarize significant events into wiki updates.
- Maintain tone, realism, and immersion.

The LLM must not be the sole authority for world state, economic systems, resources, geography, long-term consistency, or simulation constraints.

## Initial Wiki Shape

The source document suggests future wiki areas for world memory, regions, and factions. Early pages can start with world overview, timeline, region summaries, faction summaries, and daily briefings as the simulation begins producing history.

## Testing And Verification Defaults

- Verify that player actions cannot change canonical reality without a database update and event record.
- Verify that narration is generated from current state and recent history.
- Verify that significant outcomes are eligible for wiki summarization.
- Verify that daily progression can run without resetting player or world state.
- Verify that Connected and Unconnected player paths persist across sessions.
