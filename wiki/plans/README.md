# Plans

This folder contains durable implementation plans for the project. It is the gate between intent and code.

## Structure

- Use `mvp/` for roadmap-delivering feature work and preserve its numbered `stages > units` hierarchy.
- Add other plan tracks only when the project earns them.
- Add a track `README.md` that explains current status, canonical ordering, and the next actionable unit.
- Keep execution plans decision-complete enough that an implementer does not need to invent product or rollout decisions.
- Treat architecture docs as reference material, not execution-plan replacements.

## Current Tracks

- [`mvp/`](mvp/README.md) - active numbered roadmap for the AreYouIn MVP.
- [`worktrees/`](worktrees/README.md) - operations plan for parallel git worktrees and AI-agent feature development.
