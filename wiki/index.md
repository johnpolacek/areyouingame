# AreYouIn Wiki

This is the maintained project knowledge and planning layer for AreYouIn.

## Overview


AreYouIn is a persistent, real-time, AI-driven global simulation about humanity's first contact with artificial superintelligence. Players enter one shared timeline, make the defining YES/NO choice, and act through natural language as the world evolves day by day.

The project is built around a strict separation between canonical world state, immutable event history, and narrative memory/artifacts. Its intended direction is a Next.js, TypeScript, AI SDK, Convex, S3 flat-file artifact storage, and pnpm stack where the LLM acts as game master and narrator while structured systems preserve coherence, consequence, and long-term continuity.

## Core Pages

- [`AGENTS.md`](AGENTS.md) - local maintenance contract for future agents
- [`../.agents/skills/project-wiki-maintainer/SKILL.md`](../.agents/skills/project-wiki-maintainer/SKILL.md) - repo-local product skill for wiki maintenance
- [`log.md`](log.md) - append-only record of bootstrap, ingest, planning, and update activity
- [`roadmap.md`](roadmap.md) - durable roadmap and stage sequence once planning begins
- [`plans/`](plans/README.md) - implementation plans and plan-track conventions
- [`plans/worktrees/`](plans/worktrees/README.md) - parallel git worktree and AI-agent development workflow plan
- [`Architecture.md`](Architecture.md) - cross-cutting reference page including locked stack decisions, public live browser boundaries, and current narration/UI guidance
- [`Sources.md`](Sources.md) - human-facing page for imported and preserved source material
- [`reference/connected-asi-response-guide.md`](reference/connected-asi-response-guide.md) - LLM response guide for the accepted YES/orb-connected experience
- [`reference/local-agent-browser-auth.md`](reference/local-agent-browser-auth.md) - local synthetic persona auth, manual dogfood session, and cleanup conventions
- [`playtests/index.md`](playtests/index.md) - generated persona playthrough reports by build, persona, scenario, and findings
