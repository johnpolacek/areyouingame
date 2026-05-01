---
name: are-you-in-worktrees
description: Create and manage AreYouIn git worktrees for parallel CLI Codex feature development. Use when the user asks to use the project worktree workflow, create a new feature branch/worktree, create the polish lane, run multiple agents in parallel, start a branch for implementing recommendations, or prepare CLI Codex commands for a new AreYouIn task.
---

# AreYouIn Worktrees

Use this skill to set up or explain the repo's worktree workflow for parallel feature development with CLI Codex.

## Core Rules

- Prefer one worktree per feature branch under `../AreYouIn.worktrees/<branch-slug>`.
- Use `polish` only for small bug fixes and UI/UX tweaks that should merge back frequently.
- Do not put schema changes, Convex data-shape changes, broad refactors, prompt rewrites, or gameplay flow changes on `polish`.
- Use named feature branches for material work, for example `feature/playthrough-recommendations` or `feature/admin-playtest-filters`.
- Start from `/Users/johnpolacek/Workspace/AreYouIn` unless the current checkout is clearly the intended integration checkout.
- Before creating or merging worktrees, run `pnpm wt:doctor` when practical.
- Before merging or assigning overlapping work, run `pnpm wt:overlap`.
- Respect dirty worktrees. Never delete, reset, or overwrite user changes.

## Create A Worktree

1. Choose a concise branch name from the task.
   - For implementation recommendations from a playthrough analysis, prefer `feature/playthrough-recommendations` unless the request names a more specific feature.
   - For quick UI/fix miscellany, use `polish`.
2. From the main checkout, run:

   ```bash
   cd /Users/johnpolacek/Workspace/AreYouIn
   pnpm wt:doctor
   pnpm wt:create <branch>
   ```

3. For the polish lane, run:

   ```bash
   cd /Users/johnpolacek/Workspace/AreYouIn
   pnpm wt:create polish --polish
   ```

4. If the task changes Convex schema, state shape, seed data, auth assumptions, or canonical gameplay state, create the worktree with isolated intent:

   ```bash
   pnpm wt:create <branch> --convex isolated
   ```

   Then tell the user the script does not automatically provision the isolated Convex deployment yet. They should create/select the branch-specific Convex deployment, update `.env.local`, and run `pnpm convex:sync-secret`.

## Hand Off To CLI Codex

After creating a worktree, give the user exact commands for one terminal per branch:

```bash
cd /Users/johnpolacek/Workspace/AreYouIn.worktrees/<branch-slug>
codex
```

To run the app inside that worktree:

```bash
pnpm dev
```

Portless gives branch-specific URLs:

```text
https://<branch-slug>.are-you-in.localhost
```

The main checkout URL is:

```text
https://are-you-in.localhost
```

## Ongoing Branch Workflow

- Keep `main` as the integration checkout.
- Work in each feature worktree with its own CLI Codex session.
- Commit inside each worktree after tests/build pass.
- Merge `polish` into `main` frequently.
- After merging `polish` or any shared fix into `main`, merge or rebase `main` into active feature worktrees.
- Before merging a feature branch into `main`, run:

  ```bash
  cd /Users/johnpolacek/Workspace/AreYouIn
  pnpm wt:overlap
  ```

## Cleanup

Use cleanup commands from the main checkout:

```bash
pnpm wt:list
pnpm wt:clean
pnpm wt:prune
```

`pnpm wt:clean` refuses dirty worktrees unless forced. Do not force unless the user explicitly approves deleting uncommitted work.
