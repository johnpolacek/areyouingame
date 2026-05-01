# Project Wiki Agent Guide

This `wiki/` directory is the maintained deep-documentation and planning layer for the project.

Use it to preserve durable project context that should survive individual agent sessions: product shape, architecture, decisions, source artifacts, rollout notes, implementation planning, and open questions.

## Source Of Truth

- [`index.md`](index.md) is the front door and running catalog of durable wiki pages.
- [`log.md`](log.md) is the append-only record of bootstrap, ingest, planning, and update activity.
- [`plans/`](plans/README.md) holds implementation plans and execution gates.
- [`Architecture.md`](Architecture.md) is the optional home for cross-cutting reference guidance when the project earns it.
- [`Sources.md`](Sources.md) is the human-facing source-artifact page for the project.
- `wiki/sources/raw/` is the plain storage path for preserved originals when provenance matters.
- [`../.agents/skills/project-wiki-maintainer/SKILL.md`](../.agents/skills/project-wiki-maintainer/SKILL.md) is the repo-local product skill that defines the wiki-maintenance contract for this project.

## Default Structure

Freshly bootstrapped projects start with this default wiki shape:

- [`AGENTS.md`](AGENTS.md)
- [`index.md`](index.md)
- [`log.md`](log.md)
- [`roadmap.md`](roadmap.md)
- [`plans/README.md`](plans/README.md)
- [`Architecture.md`](Architecture.md)
- [`Sources.md`](Sources.md)

Add other plan tracks or durable notes only when the project earns them. `Architecture.md` is available by default but remains optional in practice.

## Working Rules

- Inspect [`index.md`](index.md) before making structural changes.
- Update [`index.md`](index.md) when creating or materially changing durable wiki pages.
- Update [`log.md`](log.md) when bootstrapping, ingesting, planning, or materially changing durable documentation.
- Keep high-level cross-project summaries in `/Users/johnpolacek/Wiki`. Keep deep project knowledge here.
- Use [`plans/mvp/`](plans/mvp/README.md) for roadmap-delivering feature work and update the most relevant existing plan file for meaningful bugfix, polish, cleanup, and refactor work.
- Treat [`Architecture.md`](Architecture.md) as optional cross-cutting reference material, not as a substitute for execution plans.
- Keep source artifacts cataloged in [`Sources.md`](Sources.md), with preserved originals stored under `wiki/sources/` and raw-input files under `wiki/sources/raw/` when exact wording or provenance matters.
- Keep implementation plans under [`plans/`](plans/README.md).
- Keep durable cross-cutting architecture guidance in [`Architecture.md`](Architecture.md) unless a later contract deliberately reintroduces a more granular structure.
- Treat [`../.agents/skills/project-wiki-maintainer/SKILL.md`](../.agents/skills/project-wiki-maintainer/SKILL.md) as the canonical repo-local product skill for wiki work; update this local entrypoint when the skill location or adoption guidance changes, not by duplicating the full skill guidance here.
- Keep the root [`../AGENTS.md`](../AGENTS.md) build-version rule in force: material app code or product content changes should bump the aligned `package.json` and `build-version.json` versions before commit, while docs-only changes, wiki/planning updates, and agent skill installs/updates do not require a bump.
- Do not store product-owned app state in project markdown; markdown here is project content and durable coordination context.
- Do not create root-level `docs/` or `tasks/` folders for maintained project knowledge unless the project later needs runtime-owned documentation elsewhere.

## Current Posture

- This wiki was bootstrapped from the MarkdownStack Project Wiki Standard on 2026-04-24. Replace placeholders with project-specific context as the project becomes clearer.

## MarkdownStack Product Skill

<!-- markdownstack-project-wiki-maintainer-skill-reference:start -->
- Follow [`../.agents/skills/project-wiki-maintainer/SKILL.md`](../.agents/skills/project-wiki-maintainer/SKILL.md) as the repo-local product skill for wiki maintenance.
- Treat MarkdownStack bootstrap updates to that skill as additive project setup, without overwriting project-specific wiki content.
<!-- markdownstack-project-wiki-maintainer-skill-reference:end -->
