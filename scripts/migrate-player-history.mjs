import { ConvexHttpClient } from 'convex/browser';
import { makeFunctionReference } from 'convex/server';

// Rollout: deploy Convex first, run this backfill, then release the web app.
// node --env-file=.env.local scripts/migrate-player-history.mjs
// Existing environment variables can select a different deployment explicitly.
// This script never deploys or selects a production target on your behalf.
const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const backendSecret = process.env.AREYOUIN_BACKEND_SECRET;
if (!url || !backendSecret) throw new Error('NEXT_PUBLIC_CONVEX_URL and AREYOUIN_BACKEND_SECRET are required.');
const client = new ConvexHttpClient(url);
const migrate = makeFunctionReference('playerStore:migratePlayerHistoryPage');
for (const phase of ['players', 'activity']) {
  let cursor = null;
  let pages = 0;
  while (true) {
    const result = await client.mutation(migrate, { backendSecret, phase, cursor });
    pages++;
    if (result.isDone) break;
    cursor = result.continueCursor;
  }
  console.log(`${phase}: migrated ${pages} pages`);
}
