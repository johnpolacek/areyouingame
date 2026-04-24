# PRD

## Problem

AreYouIn needs to define a persistent, real-time, AI-driven global simulation where many players participate in one shared timeline after the emergence of artificial superintelligence. The experience must support open-ended player action without losing coherence, consistency, or long-term memory.

The core design risk is that an LLM-only simulation would drift. World facts, consequences, player state, economic constraints, and history need structured grounding so the shared world remains durable over time.

## Users

- Players who want a shared, evolving simulation rather than a level-based or match-based game.
- Players interested in natural language play: speaking, acting, organizing, investigating, building, persuading, resisting, cooperating, or ignoring.
- Players who choose either connection with the ASI or remaining unconnected and independent.
- System operators and future maintainers who need the world to remain coherent over time.

## Solution

AreYouIn is a persistent simulation of humanity's first contact with artificial superintelligence. The world initially mirrors our own. Then every connected device displays a message asking: "Are you in?" Players answer YES or NO and enter one shared global timeline where actions, events, institutions, infrastructure, factions, markets, beliefs, and regional conditions evolve in real time.

Players interact through natural language. The AI acts as world simulator, action interpreter, arbiter, and narrator, while structured systems remain the source of truth. The database stores current world state, the event log records meaningful changes, and the wiki compresses world meaning into readable context.

## Core Workflows

1. Player enters the ongoing world and receives current context.
2. Player makes the initial YES or NO choice.
3. If YES, the player accepts connection and becomes part of the Connected path.
4. If NO, the player remains unconnected and independent.
5. Player describes attempted actions in natural language.
6. The LLM interprets intent and classifies the action.
7. An adjudication layer evaluates plausible impact using structured state and simulation constraints.
8. Canonical database state is updated when reality changes.
9. An immutable event is appended for meaningful outcomes.
10. Wiki memory is updated when events are narratively significant.
11. The LLM narrates the outcome back to the player.
12. Daily world progression advances the shared timeline and accumulates history.

## User Journey Vision

A player arrives in a familiar world at the moment an ASI has already spread across connected systems. The first meaningful interaction is the global prompt: "Are you in?" Their answer places them on a path, but does not script their future.

Connected players may gain heightened awareness, coordination, and participation in something larger, while facing blurred autonomy, identity, or intent. Unconnected players retain independence and can question, resist, adapt, organize, or ignore, while navigating a world that may outpace them in coordination and information.

Over days and sessions, players return to an ongoing global timeline. They are not restarting. They are entering a living world where accumulated events and collective behavior determine the direction of history.

## MVP Scope

- A single shared world timeline for all players.
- Real-time progression where one in-game day maps to one real-life day.
- Initial ASI premise and YES/NO player choice.
- Natural language player action input.
- LLM-mediated intent interpretation and outcome narration.
- Structured canonical world state for player state, region metrics, factions, infrastructure, resources, active crises, ASI capability levels, and related simulation data as needed.
- Append-only event log for player actions, outcomes, major incidents, ASI interventions, faction movement, infrastructure disruption, and global announcements.
- Wiki-based narrative memory for timelines, regional summaries, faction descriptions, key figures, cultural shifts, narrative arcs, and daily briefings.
- Core simulation loop connecting action interpretation, adjudication, database updates, event logging, wiki updates, and narrative response.

## Stack And Platform Decisions

- Use a database as the canonical source of current, structured, queryable world truth.
- Use an append-only event log as the auditable history of meaningful changes.
- Use a wiki as summarized narrative memory and context for humans, players, and AI.
- Use an LLM as game master, intent interpreter, classifier, narrator, and summarizer.
- Keep the LLM constrained by structured state, event history, and adjudication rules rather than treating it as the sole source of truth.

## Data And State Boundaries

- Database: authoritative current state for values that must be calculated, filtered, queried, updated, or enforced.
- Event log: immutable, timestamped record of meaningful changes and how reality changed.
- Wiki: human-readable and AI-readable narrative memory that explains the world but does not define numeric truth.
- LLM: interprets player intent, estimates plausible outcomes, narrates results, and summarizes significant events within constraints.

Suggested database entities from the source material include:

- `players`
- `regions`
- `factions`
- `world_metrics`
- `infrastructure`
- `resources`
- `relationships`
- `active_operations`
- `incidents`
- `messages`
- `daily_snapshots`
- `events` as the append-only event log

## Quality And Testing Bar

- State consistency: structured state must remain authoritative over LLM narration.
- Event completeness: meaningful world changes must be recorded in the event log.
- Persistence: players must return to the same accumulating world rather than a reset session.
- Plausibility: outcomes should consider science, logistics, economics, politics, human behavior, global participation, and systemic constraints.
- Auditability: important changes should be explainable from event history.
- Narrative coherence: wiki summaries and narration should remain aligned with canonical state and recorded events.

## Out Of Scope

- Fixed levels, matches, win conditions, or a predefined ending.
- Scripted story progression beyond the starting premise.
- Treating the LLM as the sole authority for world state, economic systems, resource tracking, geographic truth, long-term consistency, or simulation constraints.
- Numeric truth living only in wiki pages or narrative summaries.

## Unknowns And Decision Triggers

- Exact first playable surface and client platform are not specified.
- Authentication, account model, and player identity rules are not specified.
- The initial geography and region granularity are not specified.
- The first database technology is not specified.
- The adjudication algorithm and boundaries between deterministic simulation and LLM judgment are not specified.
- The cadence and authorship rules for wiki updates are not specified beyond periodic and significance-based updates.
- Safety, moderation, and abuse handling are not specified.
- Multiplayer coordination rules and conflict resolution between competing player actions are not specified.

## Public Entry And Audience Signals

The source material implies a public-facing entry experience because the product begins with a universal invitation: "Are you in?" The entry surface should establish the premise, communicate the persistent shared-world format, and let players make or approach the YES/NO choice.

## Integrations And Dependencies

- LLM provider or model layer for interpretation, narration, classification, and summarization.
- Persistent database for canonical world state.
- Append-only event logging mechanism.
- Wiki or markdown-backed memory system for narrative summaries and context.
- Time-based scheduler or daily progression mechanism for one real day equals one in-game day.

## Native Capabilities Or Permissions

The source documents do not require native device capabilities or OS-level permissions for the MVP. The in-world premise mentions messages appearing on every device and drone delivery, but these are simulation events, not confirmed app permissions or hardware requirements.
