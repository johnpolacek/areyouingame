# Stage 05: Canonical State, Event History, And Narrative Memory

## Stage Goal

Expand the production backend into deeper authoritative world and player state, append-only events for meaningful changes, and S3-backed narrative memory/artifact bundles after the first chat/reveal/choice loop proves the product spine.

## Current Status

Completed MVP product-spine stage. Stage 05 Unit 01 is completed: the reveal is now the first text-capable action loop, including deferred interruptions, end-day deferrals, and first post-choice action persistence. Stage 05 Unit 02 is completed: shared Day 1 global storyline context is available to constrain later player turns. Stage 05 Unit 03 is completed: the first NO/unconnected post-choice action resolves into a persisted narrative response with append-only event history. Stage 05 Unit 04 is completed: the first YES/connected path persists deterministic waiting, package delivery eligibility, optional unboxing, orb reveal, and connected-path event history. Stage 05 Unit 05 is completed: revealed-orb play now has a canonical `orbLifecycle` with delivered, accepted, and lost outcomes. Stage 05 Unit 06 is completed: an orb-accepted player can take the first connected ASI interaction through a guarded, persisted, append-only turn.

## Scope

- Include: text-based YES/NO response classification, deferred interruption attempts, first post-choice open action, branch-specific YES/NO continuations, expanded canonical state, append-only event history, narrative memory update boundaries, S3 artifact conventions for stable/generated narrative material, and the rule that durable summaries explain the world but do not own numeric or enforceable truth.
- Exclude: full global MUD simulation breadth until the first post-choice action loop proves the interaction pattern.

## Units

- [Stage 05, Unit 01: Text YES/NO Response And Deferred Interruptions](units/stage-05/01-text-yes-no-response-and-deferred-interruptions.md) - completed.
- [Stage 05, Unit 02: Day 1 Global Storyline Context](units/stage-05/02-day-1-global-storyline-context.md) - completed.
- [Stage 05, Unit 03: First NO/Unconnected Post-Choice Action Response](units/stage-05/03-first-post-choice-action-response.md) - completed.
- [Stage 05, Unit 04: First YES Connected Path, Drone, And Orb](units/stage-05/04-first-yes-connected-path-drone-and-orb.md) - completed.
- [Stage 05, Unit 05: First Orb Decision](units/stage-05/05-first-orb-decision.md) - completed.
- [Stage 05, Unit 06: First Connected ASI Interaction](units/stage-05/06-first-connected-asi-interaction.md) - completed.

## Acceptance Criteria

- This stage begins with the text-based reveal response loop before broader structured-state and memory work.
- Later unit plans can be added incrementally without rewriting the roadmap structure.

## Verification

- Confirm the stage goal still fits the top-level MVP roadmap after the first chat/reveal loop.
- Confirm the first unit keeps the core decision invariant clean: only YES or NO completes the decision, while deferred responses remain pending and get recorded as attempts.

## Manual Steps

- Implement one decision-complete unit at a time.
- Keep deferred reveal interactions narrow until canonical event/history design is expanded.

## Assumptions

- A visible skip option would weaken the central threshold. Deferral should be expressed through open text actions that the game interprets and answers, not through a third button.
- The first YES/NO answer is a current branch state rather than an irreversible identity. Later canonical state should allow NO players to switch to YES and should allow YES players to lose, destroy, refuse, or reject the orb, potentially returning to unconnected play or entering a separate rejected/disconnected category.
