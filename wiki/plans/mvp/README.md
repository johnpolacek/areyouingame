# AreYouIn MVP Plan

This MVP plan starts with a hello-world-first greenfield build, then incrementally turns the source concept into a daily persistent shared simulation loop grounded in structured state, immutable history, and narrative memory.

## Current Status

- Next execution unit: [Stage 5: Canonical State, Event History, And Narrative Memory](stage-05-canonical-state-and-event-history.md)
- Most recently completed stage: [Stage 3: Daily Player Creation](stage-03-daily-player-creation.md)
- Most recently completed unit: [Stage 4, Unit 05: Submit YES/NO Choice And First Consequence](units/stage-04/05-submit-yes-no-choice-and-first-consequence.md)
- Current execution stage: [Stage 5: Canonical State, Event History, And Narrative Memory](stage-05-canonical-state-and-event-history.md)
- Status: the first-chat path now persists the opening response, YES/NO reveal, and exactly-once first decision in Convex before showing a deterministic first consequence.

## Stages

- [Stage 01: Hello World And Stack Lock](stage-01-hello-world-and-stack-lock.md) - completed stage.
  Establish the executable foundation before scaffold work: lock the initial stack, then create the smallest running app surface that proves the chosen runtime can start cleanly.
- [Stage 02: Daily Game Entry And Auth](stage-02-daily-game-entry-and-auth.md) - completed stage.
  Build the public `Join Today's Game` entry path, resolve today's global game, and gate joining behind Clerk sign-in or account creation.
- [Stage 03: Daily Player Creation](stage-03-daily-player-creation.md) - completed stage.
  Let an authenticated user create exactly one player for today's game before entering the surprise first-chat YES or NO moment.
- [Stage 04: First Chat And Natural Language Action Loop](stage-04-natural-language-action-loop.md) - completed stage.
  Connect the player to a private game chat, reveal the `Are you in?` choice at the end of the first game prompt, then grow toward LLM interpretation, adjudication, event logging, and grounded narrative response.
- [Stage 05: Canonical State, Event History, And Narrative Memory](stage-05-canonical-state-and-event-history.md) - active planning target; later units will be added incrementally.
  Expand the production backend into deeper authoritative world state, append-only events for meaningful changes, and narrative memory updates for significant world history.
- [Stage 06: Daily Game Lifecycle And Recaps](stage-06-daily-progression.md) - planned product-spine unit.
  Implement the global daily game lifecycle, date-id game creation, durable archives, end-of-day public recaps, and return-player continuity across accumulated games.
- [Stage 07: MVP Hardening And Commit Flow](stage-07-mvp-hardening-and-commit-flow.md) - directional stub; later units will be added incrementally.
  Tighten verification, persistence checks, failure recovery, legal launch readiness, and local commit behavior so successful scaffold and implementation runs are staged and committed while pushes remain explicit user decisions.
