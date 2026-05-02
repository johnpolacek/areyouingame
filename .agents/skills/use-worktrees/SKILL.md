---
name: use-worktrees
description: Create and manage AreYouIn git worktrees for parallel CLI Codex feature development. Use when the user asks to use the project worktree workflow, create a new feature branch/worktree, create the polish lane, run multiple agents in parallel, start a branch for implementing recommendations, or prepare CLI Codex commands for a new AreYouIn task.
---

# Use Worktrees

Use this skill to set up or explain the repo's worktree workflow for parallel feature development with CLI Codex.

## Core Rules

- Prefer one worktree per feature branch under `../AreYouIn.worktrees/<branch-slug>`.
- Use `polish` only for small bug fixes and UI/UX tweaks that should merge back frequently.
- Do not put schema changes, Convex data-shape changes, broad refactors, prompt rewrites, or gameplay flow changes on `polish`.
- Use named feature branches for material work, for example `feature/playthrough-recommendations` or `feature/admin-playtest-filters`.
- Start from `/Users/johnpolacek/Workspace/AreYouIn` unless the current checkout is clearly the intended integration checkout.
- Before creating or merging worktrees, run `pnpm wt:doctor` when practical.
- Before merging or assigning overlapping work, run `pnpm wt:overlap`.
- When a worktree branch is complete and committed, prefer `pnpm wt:finish <branch>` from the main checkout to merge it, remove the linked worktree, prune stale metadata, and delete the merged branch.
- Let Portless derive the readable route from the worktree branch slug. Do not use fixed localhost ports for runner targets.
- Persona playtests use worktree-local `agent-browser` isolation, but shared Convex deployments are not parallel-safe. Run only one shared-deployment `pnpm convex:dev` at a time, or use `--convex isolated` for concurrent stateful/gameplay playtests.
- `pnpm convex:dev` is guarded against shared-deployment races. If it refuses to start, run `pnpm wt:runtime` to find the conflicting process, then stop it or move the branch to isolated Convex.
- Respect dirty worktrees. Never delete, reset, or overwrite user changes.

## Portless Routes

- Main checkout may use Portless auto-assignment or port `3000`.
- Each linked worktree branch should use a readable Portless route derived from the branch slug, for example `https://demo.are-you-in.localhost` for `feature/demo`.
- `pnpm wt:create` records the route metadata in `.env.worktree.local` as `AREYOUIN_PORTLESS_ROUTE_NAME`, `AREYOUIN_PORTLESS_BASE_NAME`, and `AREYOUIN_PORTLESS_URL`.
- For handoffs, target the named Portless URL, not `http://localhost:<port>`.

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
5. Use the named Portless URL printed by `pnpm wt:create`; do not assign a fixed numeric localhost port for the runner target.

## Hand Off To CLI Codex

After creating a worktree, give the user exact commands for one terminal per branch:

```bash
cd /Users/johnpolacek/Workspace/AreYouIn.worktrees/<branch-slug>
codex
```

To run the app inside that worktree:

```bash
pnpm convex:dev
```

If `pnpm convex:dev` refuses to start, do not bypass it for normal playtests. Run:

```bash
pnpm wt:runtime
```

Then stop the listed stale/conflicting process or switch the branch to an isolated Convex deployment.

In a second terminal in the same worktree, run Next through Portless:

```bash
pnpm next:dev
```

If running both processes in one terminal is more important than separate logs, use:

```bash
pnpm dev
```

Portless gives branch-specific URLs from the worktree branch slug:

```text
https://<readable-branch-name>.are-you-in.localhost
```

The main checkout URL is:

```text
https://are-you-in.localhost
```

## Browser Playtests

`pnpm playtest:persona` automatically isolates `agent-browser` state per worktree under `.agent-browser-worktree/`.

Use these commands when browser automation gets noisy:

```bash
pnpm agent-browser:doctor
pnpm agent-browser:cleanup-playtests -- --dry-run
pnpm agent-browser:cleanup-playtests
```

Cleanup must target only AreYouIn `ayi-*` playtest sessions/artifacts. Do not close unrelated user sessions.

Do not run browser persona playtests concurrently across multiple worktrees that share the same Convex dev deployment. The browser profiles are isolated, but the active Convex handler is deployment-wide and can be overwritten by another checkout.

## Ongoing Branch Workflow

- Keep `main` as the integration checkout.
- Work in each feature worktree with its own CLI Codex session.
- Commit inside each worktree after tests/build pass.
- When the branch is ready, finish it from the main checkout:

  ```bash
  cd /Users/johnpolacek/Workspace/AreYouIn
  pnpm wt:finish <branch>
  ```

  `pnpm wt:finish` refuses dirty main/worktree checkouts, pulls `main` with `--ff-only` when `origin/main` exists, runs overlap detection, merges the branch into `main`, removes the linked worktree, prunes worktree metadata, and deletes the branch after Git confirms it is merged. Use `--keep-branch` to preserve a merged feature branch, `--no-clean` to keep the worktree directory, or `--no-pull` when offline.
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
pnpm wt:runtime
pnpm wt:finish <branch>
pnpm wt:clean
pnpm wt:prune
pnpm agent-browser:cleanup-playtests -- --dry-run
```

`pnpm wt:clean` refuses dirty worktrees unless forced. Do not force unless the user explicitly approves deleting uncommitted work.
