# Architecture

Use this page for optional durable cross-cutting reference guidance that does not fit cleanly into feature planning.

## Working Rule

- Treat this page as reference material, not as a substitute for execution plans.
- Keep roadmap capability work under `wiki/plans/mvp/` and route meaningful maintenance work through the most relevant existing plan file under `wiki/plans/`.
- Extend this page with clear sections only when the project has enough durable material to justify them.

## Initial Stack Decisions

These are the locked greenfield defaults for the MVP scaffold. They record the executable direction before package installation or file generation.

- Runtime shell: Next.js app runtime with TypeScript.
- Frontend tooling: Tailwind CSS for styling, shadcn/ui for application components, and Base UI primitives for lower-level accessible behavior where needed.
- Package manager: pnpm.
- Persistence model: Convex as the canonical backend for current structured world state and append-only event history.
- AI boundary: AI SDK as the LLM integration boundary for intent interpretation, classification, adjudication support, narration, and summarization. The LLM is not the source of truth for world state.
- Testing baseline: Vitest for isolated logic and Playwright for running app smoke checks.
- Source precedence: imported PRD, technical brief, wiki overview, roadmap, then supporting source artifacts.

## Durable Architecture Topics

Common topics include:

- system boundaries and runtime maps
- data or storage conventions
- integration contracts and operational boundaries
- project-wide UI or UX or design-system guidance

If the project does not yet need architecture guidance, this page may be removed during bootstrap review or later cleanup.
