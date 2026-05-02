# Parallel Worktrees Plan

This plan defines how AreYouIn should support multiple `git worktree` checkouts for parallel feature development with AI coding agents.

## Goal

Make it routine to run one agent per feature branch in an isolated worktree without losing time to port conflicts, missing dependencies, shared runtime state, stale disk usage, IDE confusion, or self-inflicted merge conflicts.

## Current Project Shape

- The app is a single-package pnpm project, not currently a monorepo.
- `pnpm dev` runs Convex and Next.js together through `concurrently`.
- Next.js defaults to port `3000` today.
- Convex is the live transactional backend. There is no local Postgres, Redis, Docker Compose, Prisma, or Drizzle setup in the current repo.
- `.env.local` is gitignored and contains shared Clerk, Convex, OpenAI, and S3 credentials.
- `pnpm` already reduces dependency duplication through its shared store, but each worktree still needs its own `node_modules` linker tree and build caches.

## Target Workflow

1. A developer runs a project script to create a feature worktree from the main checkout.
2. The script creates a linked worktree under a predictable sibling directory, creates or checks out a branch, copies a safe local env file, installs dependencies, and prints the branch-specific dev URL.
3. The developer starts `pnpm dev` inside that worktree.
4. Portless assigns an ephemeral app port and exposes the app at a stable readable branch-prefixed hostname, for example `https://stage-05-copy.are-you-in.localhost`.
5. Each worktree uses isolated local build/cache directories and, where needed, an isolated Convex deployment or explicitly shared read-only dev deployment.
6. Cleanup is a first-class command that prunes stale worktrees, dev servers, caches, and orphaned Portless routes.

## Branch Lanes

Use short-lived feature branches for material product work. Use a single long-running `polish` branch for light bug fixes and UI/UX tweaks when they do not overlap with active feature ownership. Keep `polish` boring: merge it into `main` frequently, then merge or rebase `main` back into active feature branches so small fixes do not drift.

Do not put schema changes, Convex data-shape changes, broad refactors, or prompt/flow rewrites on `polish`. Those deserve named feature branches and, when stateful, isolated runtime state.

## Phase 1: Portless Dev Server Isolation

Add Portless as the standard development entrypoint.

- Use the globally installed `portless` CLI. The local `wt:doctor` command verifies it is present on `PATH`.
- Keep the real Next command behind a direct script:
  - `next:dev:app`: `next dev`
  - `next:dev`: `node scripts/next-dev-portless.mjs`
- Keep `dev` as the combined app command:
  - `dev`: `concurrently -n convex,next -c magenta,cyan "pnpm convex:dev" "pnpm next:dev"`
- Keep `PORTLESS=0 pnpm next:dev:app` as the escape hatch for debugging without the proxy.
- Run `portless trust` once per machine and document the HTTPS certificate prompt.
- Use `.localhost` by default. If Safari routing is needed, run `portless hosts sync`.

Portless already detects linked git worktrees and prepends the readable branch name as a subdomain. That means the main checkout keeps `https://are-you-in.localhost`, while a branch named `feature/stage-05-copy` gets `https://stage-05-copy.are-you-in.localhost`.

## Phase 2: Worktree Helper Scripts

Add a small `scripts/worktrees/` toolset and package scripts:

- `pnpm wt:create <branch>` creates a linked worktree at `../AreYouIn.worktrees/<branch-slug>`.
- `pnpm wt:list` shows active worktrees, branch names, paths, disk usage, and likely dev URLs.
- `pnpm wt:doctor` checks whether Portless is installed/trusted, whether `pnpm install` has been run, whether `.env.local` exists, and whether Convex is pointed at the intended deployment.
- `pnpm wt:clean` removes stale worktrees only after verifying their branches are merged, pushed, or explicitly confirmed.
- `pnpm wt:finish <branch>` completes a committed worktree branch by checking for dirty state, updating `main` with `git pull --ff-only` when possible, running overlap detection, merging into `main`, removing the linked worktree, pruning metadata, and deleting the merged branch unless asked to keep it.
- `pnpm wt:prune` runs `git worktree prune` and uses Portless orphan cleanup when the installed Portless version exposes it.
- `pnpm wt:overlap` compares changed files across active worktrees before merge/rebase.

The creation script should copy `.env.local` from the main checkout only when the destination file does not exist. It should never overwrite local secrets. Later, split this into `.env.shared.local` plus generated `.env.worktree.local` if the environment surface grows.

## Phase 3: Dependency And Cache Policy

Use pnpm's shared store and avoid inventing a custom `node_modules` sharing scheme.

- Require `pnpm install --frozen-lockfile` in each new worktree.
- Keep one linker tree per worktree. Do not symlink `node_modules` between worktrees because package lifecycle scripts, generated bins, and framework caches can become surprising.
- Add cleanup targets for `.next`, `.turbo` if introduced later, `coverage`, `test-results`, Playwright artifacts, and other generated directories.
- Document `pnpm store prune` as occasional global maintenance, not as part of routine cleanup.
- If disk use becomes painful, add a disk report to `pnpm wt:list` before changing package-manager behavior.

## Phase 3a: Agent-Browser Runtime Isolation

Persona playtests use `agent-browser`, which stores daemon/session state under the user's home directory by default. To keep parallel worktrees from colliding, `pnpm playtest:persona` creates an untracked per-worktree runtime directory and passes it to every browser command:

- `.agent-browser-worktree/config.json`
- `.agent-browser-worktree/profiles/<run-id>/`
- `.agent-browser-worktree/downloads/<run-id>/`
- `.agent-browser-worktree/screenshots/<run-id>/`

Playtest browser sessions are named with the current branch and run id, for example `ayi-feature-foo-2026-05-01t...`. Multiple worktrees may run persona playtests in parallel. Use `pnpm agent-browser:doctor` to inspect active sessions and `pnpm agent-browser:cleanup-playtests -- --dry-run` before removing only AreYouIn `ayi-*` playtest artifacts.

## Phase 4: Convex And Runtime State Isolation

The current silent-killer risk is not local Postgres or Docker volumes; it is multiple branches sharing one Convex dev deployment and one set of Clerk users.

Default policy:

- UI-only and prompt-only branches may use the shared dev Convex deployment.
- Schema, migration-like data changes, generated Convex API changes, and seed/state changes should use an isolated Convex deployment per active worktree.
- Any branch that changes authentication assumptions, player identity shape, daily game ids, or canonical gameplay state should be treated as stateful and isolated.

Implementation approach:

- Extend `pnpm wt:create` with a `--convex shared|isolated` option, defaulting to `shared` until the script is proven.
- For `isolated`, generate or select a branch-specific Convex dev deployment and write the resulting `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOY_KEY` into that worktree's `.env.local`.
- Run `pnpm convex:sync-secret` after creating or changing a worktree-specific Convex deployment so `AREYOUIN_BACKEND_SECRET` matches.
- Add `pnpm wt:doctor` checks that compare the local env fingerprint against the selected Convex deployment via the existing secret-check script.
- Add a rule that destructive data resets or schema experiments happen only in isolated deployments.

Clerk remains shared for now. If auth callback URLs or user metadata tests become branch-sensitive, create a separate Clerk dev instance or configure branch hostnames as allowed origins in Clerk.

## Phase 5: Future Docker Or Local Service Isolation

There is no Docker Compose service stack today, but define the convention before it exists:

- Compose project names must include the worktree slug: `COMPOSE_PROJECT_NAME=areyouin_<slug>`.
- Local database names must include the worktree slug.
- Docker volumes must include the worktree slug.
- Any service exposed through a fixed port should either run behind Portless aliases or use generated per-worktree ports.
- Add generated `.env.worktree.local` values for service names, database URLs, and aliases instead of hand-editing `.env.local`.

## Phase 6: IDE And Agent Ergonomics

Document the expected editor shape so each agent has a clean room:

- Open each worktree as its own IDE window or Codex workspace.
- Treat the main checkout as the coordination and integration checkout.
- Keep one agent per worktree/branch.
- Do not run broad formatters from multiple worktrees at the same time.
- Prefer branch names that describe ownership, for example `stage-05-orb-rejection`, `ui-admin-playtest-report`, or `fix-convex-secret-check`.
- Add a `wt:doctor` warning when a worktree is on the same branch as another checkout.

## Phase 7: Merge-Overlap Detection

Git will not warn that two agents edited the same files until merge time, so add a lightweight early-warning layer.

- `pnpm wt:overlap` should compare changed files across all active worktrees.
- Show overlapping files grouped by branch.
- Treat overlap in generated files as lower risk if generated from the same source, but do not ignore it.
- Run `pnpm wt:overlap` before merging, rebasing, or asking an agent to make broad edits.
- Add optional ownership notes in plan docs for larger parallel work, especially when multiple agents touch `app/`, `lib/player-store.ts`, or `convex/playerStore.ts`.

## Phase 8: Cleanup And Retention

Make cleanup a habit because stale worktrees are the disk-space failure mode.

- Use `../AreYouIn.worktrees/` as the only default location for linked worktrees.
- Include disk usage in `pnpm wt:list`.
- Mark worktrees older than 7 days with no uncommitted changes as stale.
- Mark worktrees older than 14 days as cleanup candidates even if their branch is not merged.
- `pnpm wt:clean` should refuse to delete uncommitted work unless passed an explicit force flag.
- `pnpm wt:prune` should run Portless cleanup for orphaned dev servers after worktree removal.

## Implementation Units

1. Add Portless dev entrypoint and document first-run trust behavior.
2. Add `wt:create`, `wt:list`, `wt:doctor`, and `wt:prune` scripts for branch/path/env/dependency basics.
3. Add `wt:overlap` changed-file comparison across active worktrees.
4. Add Convex isolation support for stateful branches.
5. Add cleanup retention reporting and optional force removal.
6. Revisit Clerk origin/auth isolation after the first two parallel stateful branches.

## Open Questions

- Should isolated Convex deployments be created automatically or should the script print manual setup commands first?
- Should worktree env files copy the full `.env.local` or should we introduce `.env.shared.local` for secrets plus generated per-worktree overrides?
- Should the main checkout be allowed to run `pnpm dev`, or should it become coordination-only once the worktree workflow is established?
- How much should `wt:create` automate branch naming and ownership metadata for agent handoffs?

## First Recommended Change

Start small: add Portless and a basic worktree create/list/doctor script set before automating Convex deployment creation. This solves the first failure mode immediately, gives the team a predictable directory convention, and keeps runtime-state isolation as an explicit opt-in until the workflow has been used on real branches.

## Implemented Baseline

- `pnpm next:dev` now runs Next through Portless using the worktree-derived route name from `.env.worktree.local`.
- `pnpm next:dev:app` remains the direct `next dev` escape hatch.
- `pnpm wt:create <branch>` creates a worktree under `../AreYouIn.worktrees/<branch-slug>`, copies env files, installs dependencies, and prints the expected Portless URL.
- `pnpm wt:create polish --polish` creates the recommended light-fix/UI-tweak lane.
- `pnpm wt:list`, `pnpm wt:doctor`, `pnpm wt:overlap`, `pnpm wt:prune`, and `pnpm wt:clean` cover inspection, health checks, overlap detection, and cleanup. With Portless `0.10.3`, route cleanup is manual through `portless list`/proxy lifecycle because `portless prune` is not exposed.
- `pnpm wt:finish <branch>` is the preferred completion path for committed worktree work: it merges back to `main`, removes the worktree, prunes metadata, and deletes the branch after Git verifies it is merged. It keeps `polish` by default because that lane is intentionally reusable.
- `pnpm playtest:persona` isolates `agent-browser` config/profile/download state per worktree so persona playtests can run in parallel.
- `pnpm agent-browser:doctor` and `pnpm agent-browser:cleanup-playtests` inspect and clean only AreYouIn `ayi-*` playtest browser artifacts.
