---
name: project-wiki-maintainer
description: Maintain this project's `wiki/` documentation and planning contract. Use when updating wiki pages, plans, logs, architecture notes, or other durable markdown inside the repo's `wiki/` for a MarkdownStack project.
---

# Project Wiki Maintainer

Use this repo-local product skill when working on this project's `wiki/` content.

## Core Rules

- Inspect `wiki/index.md` before making structural changes.
- Update `wiki/index.md` when adding or materially changing durable wiki pages.
- Update `wiki/log.md` when bootstrapping, ingesting, planning, or materially changing durable documentation.
- Keep implementation planning under `wiki/plans/`.
- Use `wiki/plans/mvp/` for roadmap-delivering feature work and preserve its numbered `stages > units` hierarchy.
- Treat `wiki/plans/fixes/` as a legacy archive of historical maintenance plans rather than the default destination for new corrective work.
- For bugfixes, polish, cleanup, and refactors that still need an execution plan, update the most relevant existing plan under `wiki/plans/` instead of creating a new dedicated fix-plan sidecar by default.
- Treat `wiki/Architecture.md` as the optional cross-cutting architecture reference page, not an execution-plan substitute.
- Keep the human-facing source page in `wiki/Sources.md`, preserve supporting artifacts under `wiki/sources/`, and use `wiki/sources/raw/` when exact wording or provenance matters.
- Do not create root-level `docs/` or `tasks/` folders for maintained project knowledge unless the project later needs runtime-owned documentation elsewhere.
- Do not store product-owned app state in project markdown; project state belongs in typed runtime storage while markdown stays project content and coordination context.

## Workflow

1. Read `wiki/AGENTS.md` and `wiki/index.md` first.
2. Update the smallest relevant wiki page instead of scattering duplicate notes.
3. Preserve numbered plan structures when the project already uses them.
4. Update `wiki/Sources.md` when the human-facing source page changes.
5. Record durable wiki changes in `wiki/log.md`.

## Boundaries

- Keep deep project knowledge in the project wiki.
- Keep high-level cross-project summaries outside the repo when they belong in a separate hub.
- Treat this skill as the durable repo-local wiki-maintenance contract that MarkdownStack bootstraps for the project.
