---
name: self-improvement
description: Capture durable Codex lessons after failed attempts. Use when Codex tries a command, workflow, browser action, tool, prompt pattern, implementation approach, or repo process that fails, then discovers a better repeatable way that may belong in an existing skill, a new skill, or the project wiki.
---

# Self-Improvement

Use this skill to turn repeatable hard-won lessons into concise agent knowledge. Be selective: a failed attempt is evidence, not automatically a rule.

## When To Capture

Capture a lesson only when all are true:

- The failed approach is likely to happen again.
- The working approach is specific enough to follow next time.
- The lesson applies beyond the current one-off task.
- The evidence is from direct repo/tool behavior, docs, tests, logs, or a verified user correction.

Do not capture lessons that are speculative, temporary, environment-specific, already documented, or only explain a single bug fix.

## Workflow

1. Record the failed attempt, observed failure, working replacement, applicability, and confidence.
2. Search existing skills before creating anything:

   ```bash
   find /Users/johnpolacek/Workspace/AreYouIn/.agents/skills /Users/johnpolacek/.agents/skills /Users/johnpolacek/.codex/skills -maxdepth 2 -name SKILL.md
   rg -n "<keyword>|<tool>|<workflow>" /Users/johnpolacek/Workspace/AreYouIn/.agents/skills /Users/johnpolacek/.agents/skills /Users/johnpolacek/.codex/skills
   ```

3. Prefer updating the narrowest relevant existing skill.
4. Create a new skill only when the lesson represents a reusable workflow that does not fit an existing skill.
5. Keep edits short, operational, and example-driven. Add the minimum instruction that would have prevented the failed attempt.
6. If the user did not explicitly ask to update skills, propose the change before editing skill files.
7. After editing, reread the skill frontmatter and changed section to verify it triggers clearly and does not overgeneralize.

## Where Lessons Belong

- Use project-local skills under `/Users/johnpolacek/Workspace/AreYouIn/.agents/skills` for AreYouIn-specific commands, workflows, prompts, product behavior, and repo conventions.
- Use global skills under `/Users/johnpolacek/.agents/skills` only for broadly reusable patterns across projects.
- Use the project wiki for narrative context, planning records, architecture notes, or decisions that humans need to read.
- Use `AGENTS.md` only for repo-wide rules that should affect every agent turn.

## Skill Writing Rules

- Frontmatter `description` must name the trigger situations clearly; it is the main discovery surface.
- Body content should be lean. Assume Codex is capable and only needs the new operational lesson.
- Prefer checklists, exact commands, and small examples over long explanations.
- Avoid adding separate README, changelog, quick reference, or installation docs.
- Preserve existing skill style and update `agents/openai.yaml` only when that skill already uses it or the new skill benefits from appearing in UI skill lists.

## Lesson Template

Use this shape while deciding what to write:

```text
Failed attempt:
Observed failure:
Working replacement:
Applies when:
Does not apply when:
Evidence:
Confidence:
Destination:
```

Only the durable lesson should go into the final skill text; the scratch template does not need to be committed.

## AreYouIn Guardrails

- Agent workflow docs and skill updates do not require `pnpm version:bump` unless they also change shipped app behavior or app-facing content.
- Respect dirty worktrees. Do not overwrite unrelated user edits while updating skills.
- Commit skill changes only when explicitly requested or when the user has already asked for the full implementation workflow including commit/push.
