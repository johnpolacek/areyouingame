# Stage 04, Unit 04: Production Backend Foundation

Replace the temporary local player store with a production-grade backend split between Convex for live transactional game state and AWS S3 flat files for stable/versioned artifacts.

## Product Intent

The prototype should be real from the start. Player creation, acknowledgements, opening responses, reveal state, and later YES/NO decisions should not depend on `.data/players.json` or any local-only store. The next implementation unit should make the existing first-chat spine durable in production before adding more gameplay state.

The desired storage model is:

- Convex owns live, queryable, auth-scoped application state and mutations.
- AWS S3 owns stable flat-file artifacts, snapshots, exports, source material, public recaps, and approved narrative-memory bundles.
- Convex stores indexes, object keys, status, ownership, and metadata for S3 artifacts when the app needs to query or enforce behavior around them.

## Scope

- Add Convex as the canonical backend for current daily game/player state.
- Replace the local `.data/players.json` store for player creation, public-gameplay acknowledgement, opening response, and first-move reveal state.
- Define the first Convex schema for users/players/daily games or the smallest equivalent tables needed by the existing flow.
- Preserve Clerk ownership checks at the mutation boundary.
- Keep direct OpenAI generation in the existing AI SDK boundary while saving generated reveal state through Convex.
- Add an AWS S3 flat-file boundary for stable artifacts without putting hot transactional player state in S3.
- Define initial S3 object-key conventions for stable artifacts such as source imports, generated daily recap snapshots, exported event bundles, and approved narrative memory.
- Add environment-variable documentation for Convex and AWS S3 storage.
- Add migration or local reset notes for replacing existing `.data/players.json` development records.

## Out Of Scope

- Building the full Stage 05 canonical world-state model.
- Full event-history and narrative-memory implementation.
- End-of-day recap generation.
- S3-backed query patterns for live gameplay.
- Admin moderation tools.
- Migrating every future planned state field before it exists.

## Acceptance Criteria

- The app no longer needs `.data/players.json` for the current gameplay path.
- Authenticated player creation persists in Convex and still enforces one player per Clerk user per daily game.
- Public-gameplay acknowledgement persists in Convex and reloads correctly.
- Opening response persists in Convex, rejects duplicates, and reloads correctly.
- First-move reveal state persists in Convex, is generated once per player/day, and reloads to the YES/NO pending screen.
- All player mutations verify Clerk auth and player ownership.
- S3 usage is documented and limited to stable/versioned artifacts, not current player mutation state.
- The backend plan clearly states when data belongs in Convex versus S3.
- Typecheck and build pass after the migration.

## Data And State Notes

- Convex should be the source of truth for current gameplay state, uniqueness constraints, mutation ordering, and user/player/day ownership.
- AWS S3 flat files are appropriate for stable, immutable, or slowly changing data where object versioning, portability, and cheap archival matter more than low-latency transactional updates.
- S3 should not enforce one-player-per-day, YES/NO uniqueness, active reveal status, or other hot gameplay invariants.
- Use Convex records to reference S3 object keys when the app needs to discover, publish, or validate artifact availability.
- Keep the storage boundary explicit in code so future stages do not casually reintroduce local state.

## Verification

- Test unauthenticated player mutations fail.
- Test duplicate daily player creation is blocked.
- Test opening response and first-move reveal survive refresh without local files.
- Test the app can run from a clean checkout without `.data/players.json`.
- Test production build succeeds with the new backend packages and generated types.
- Manually inspect that S3 environment variables and object-key conventions are documented.

## Manual Steps

- Create Convex project/environment values for local and deployment environments.
- Set `NEXT_PUBLIC_CONVEX_URL` in the Next.js runtime.
- Set the same long random `AREYOUIN_BACKEND_SECRET` in the Next.js runtime and Convex environment.
- Development S3 is configured with bucket `areyouin-artifacts-dev`, IAM user `areyouin-artifacts-dev`, and IAM policy `AreYouInArtifactDevBucketAccess`.
- Create the production AWS S3 artifact bucket, IAM user, IAM policy, and access keys before launch.

## Implementation Notes

- Added Convex and moved current live player/gameplay state behind Convex queries and mutations.
- Added `dailyGames`, `players`, and `artifactObjects` schema tables for the first production-backed slice.
- Kept Clerk verification in the existing Next.js route handlers and added a shared backend secret guard on Convex mutations.
- Added an AWS SDK for Node.js artifact helper for stable flat-file writes to real S3; no current gameplay mutation state is stored in S3.
- Replaced the file-backed `lib/player-store.ts` implementation with a Convex-backed adapter while preserving the existing route/page call sites.
- Existing local `.data/players.json` development records are not migrated automatically; create a fresh player in Convex or manually backfill if a local test record matters.
