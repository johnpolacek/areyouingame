# AreYouIn Agent Instructions

- Prefer to commit and pull whenever confident that the code is good and there are no questions about implementation.
- Every material app code or product content change must include a build version bump before commit. Use `pnpm version:bump` for routine patch changes, or `pnpm version:bump minor` / `pnpm version:bump major` when the change scope warrants it.
- Docs-only changes, wiki/planning updates, and agent skill installs/updates do not require a build version bump unless they also change shipped app behavior or app-facing content.
- Keep `package.json` and `build-version.json` versions aligned when a build version bump is required. Treat `build-version.json` as the app-facing build metadata source.
- For frontend work, use Tailwind CSS as the default styling approach and prefer shadcn/ui application components. Use Base UI primitives for lower-level accessible behavior when shadcn/ui is not a good fit.
