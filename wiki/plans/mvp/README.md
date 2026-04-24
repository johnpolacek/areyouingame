# AreYouIn MVP Plan

This MVP plan starts with a hello-world-first greenfield build, then incrementally turns the source concept into a daily persistent shared simulation loop grounded in structured state, immutable history, and narrative memory.

## Current Status

- Next execution unit: [Stage 3, Unit 01: Daily Player Creation Form](units/stage-03/01-daily-player-creation-form.md)
- Most recently completed stage: [Stage 2: Daily Game Entry And Auth](stage-02-daily-game-entry-and-auth.md)
- Most recently completed unit: [Stage 2, Unit 01: Join Today's Game And Clerk Auth Gate](units/stage-02/01-join-todays-game-and-clerk-auth-gate.md)
- Current execution stage: [Stage 3: Daily Player Creation](stage-03-daily-player-creation.md)
- Status: ready for implementation planning/execution of the daily player creation form.

## Stages

- [Stage 01: Hello World And Stack Lock](stage-01-hello-world-and-stack-lock.md) - completed stage.
  Establish the executable foundation before scaffold work: lock the initial stack, then create the smallest running app surface that proves the chosen runtime can start cleanly.
- [Stage 02: Daily Game Entry And Auth](stage-02-daily-game-entry-and-auth.md) - completed stage.
  Build the public `Join Today's Game` entry path, resolve today's global game, and gate joining behind Clerk sign-in or account creation.
- [Stage 03: Daily Player Creation](stage-03-daily-player-creation.md) - active stage; 1 unit ready now.
  Let an authenticated user create exactly one player for today's game before entering the surprise first-chat YES or NO moment.
- [Stage 04: Canonical State And Event History](stage-04-canonical-state-and-event-history.md) - directional stub; later units will be added incrementally.
  Introduce the structured Convex model for authoritative world and player state, plus append-only events for meaningful changes before any LLM-mediated consequences alter reality.
- [Stage 05: First Chat And Natural Language Action Loop](stage-05-natural-language-action-loop.md) - planned product-spine unit.
  Connect the player to a private game chat, reveal the `Are you in?` choice at the end of the first game prompt, then grow toward LLM interpretation, adjudication, event logging, and grounded narrative response.
- [Stage 06: Narrative Memory](stage-06-narrative-memory.md) - directional stub; later units will be added incrementally.
  Add markdown-backed world memory updates for significant events while preserving the rule that wiki summaries explain the world but do not own numeric or enforceable truth.
- [Stage 07: Daily Game Lifecycle And Recaps](stage-07-daily-progression.md) - planned product-spine unit.
  Implement the global daily game lifecycle, date-id game creation, durable archives, end-of-day public recaps, and return-player continuity across accumulated games.
- [Stage 08: MVP Hardening And Commit Flow](stage-08-mvp-hardening-and-commit-flow.md) - directional stub; later units will be added incrementally.
  Tighten verification, persistence checks, failure recovery, and local commit behavior so successful scaffold and implementation runs are staged and committed while pushes remain explicit user decisions.
