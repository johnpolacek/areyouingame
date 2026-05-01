# Local Agent-Browser Auth

AreYouIn uses two local `agent-browser` auth modes.

## Automated Persona Playtests

Automated smoke and persona runs use disposable synthetic users only:

```bash
pnpm playtest:persona -- --random --max-turns 1
```

The persona runner sends:

- `x-areyouin-playtest: 1`
- `x-areyouin-playtest-user: playtest:*`
- disposable `agent-browser` sessions named `ayi-*`

The server accepts those headers only when all of these are true:

- `AREYOUIN_PLAYTEST_AUTH=1`
- `NODE_ENV !== "production"`
- the request host is localhost, `127.0.0.1`, or `::1`
- `x-areyouin-playtest: 1`
- the user id is a safe `playtest:*` synthetic id

If the local app is already running without `AREYOUIN_PLAYTEST_AUTH=1`, stop it and restart with the env var, or stop it and let `pnpm playtest:persona` start `pnpm dev` itself.

## Manual Dogfooding

Manual interactive dogfooding should use the real Clerk path and a persistent `agent-browser` session/profile that is never used for automated runs:

```bash
agent-browser --session areyouin-john open http://localhost:3000
```

Sign in as `johnpolacek@gmail.com` through Clerk in that session. Keep that session separate from disposable `ayi-*` persona sessions so synthetic test data cannot contaminate the daily player account and cleanup cannot remove the manual session.

## Cleanup

Close only disposable persona sessions:

```bash
pnpm agent-browser:cleanup-playtests
```

Preview first:

```bash
pnpm agent-browser:cleanup-playtests -- --dry-run
```

The cleanup script only targets session names matching `ayi-*` and does not target `areyouin-john`.
