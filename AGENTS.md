# AreYouIn Agent Instructions

- Prefer to commit and pull whenever confident that the code is good and there are no questions about implementation.
- Every material code or content change must include a build version bump before commit. Use `pnpm version:bump` for routine patch changes, or `pnpm version:bump minor` / `pnpm version:bump major` when the change scope warrants it.
- Keep `package.json` and `build-version.json` versions aligned. Treat `build-version.json` as the app-facing build metadata source.
