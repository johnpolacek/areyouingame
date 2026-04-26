# AreYouIn MVP Plan

This MVP plan starts with a hello-world-first greenfield build, then incrementally turns the source concept into a daily persistent shared simulation loop grounded in structured state, immutable history, and narrative memory.

## Current Status

- Next execution unit: [Stage 4, Unit 04: Submit YES/NO Choice And First Consequence](units/stage-04/04-submit-yes-no-choice-and-first-consequence.md)
- Most recently completed stage: [Stage 3: Daily Player Creation](stage-03-daily-player-creation.md)
- Most recently completed unit: [Stage 4, Unit 03: First Move To YES/NO Reveal](units/stage-04/03-first-move-to-yes-no-reveal.md)
- Current execution stage: [Stage 4: First Chat And Natural Language Action Loop](stage-04-natural-language-action-loop.md)
- Status: first-move reveal generation is implemented with AI SDK, direct OpenAI, durable reveal state, deterministic fallback, and a YES/NO pending screen; ready for the choice-submission unit.

## Stages

- [Stage 01: Hello World And Stack Lock](stage-01-hello-world-and-stack-lock.md) - completed stage.
  Establish the executable foundation before scaffold work: lock the initial stack, then create the smallest running app surface that proves the chosen runtime can start cleanly.
- [Stage 02: Daily Game Entry And Auth](stage-02-daily-game-entry-and-auth.md) - completed stage.
  Build the public `Join Today's Game` entry path, resolve today's global game, and gate joining behind Clerk sign-in or account creation.
- [Stage 03: Daily Player Creation](stage-03-daily-player-creation.md) - completed stage.
  Let an authenticated user create exactly one player for today's game before entering the surprise first-chat YES or NO moment.
- [Stage 04: First Chat And Natural Language Action Loop](stage-04-natural-language-action-loop.md) - active product-spine stage; final choice-submission unit planned next.
  Connect the player to a private game chat, reveal the `Are you in?` choice at the end of the first game prompt, then grow toward LLM interpretation, adjudication, event logging, and grounded narrative response.
- [Stage 05: Canonical State, Event History, And Narrative Memory](stage-05-canonical-state-and-event-history.md) - directional stub; later units will be added incrementally.
  Introduce the structured Convex model for authoritative world and player state, append-only events for meaningful changes, and narrative memory updates for significant world history.
- [Stage 06: Daily Game Lifecycle And Recaps](stage-06-daily-progression.md) - planned product-spine unit.
  Implement the global daily game lifecycle, date-id game creation, durable archives, end-of-day public recaps, and return-player continuity across accumulated games.
- [Stage 07: MVP Hardening And Commit Flow](stage-07-mvp-hardening-and-commit-flow.md) - directional stub; later units will be added incrementally.
  Tighten verification, persistence checks, failure recovery, legal launch readiness, and local commit behavior so successful scaffold and implementation runs are staged and committed while pushes remain explicit user decisions.
