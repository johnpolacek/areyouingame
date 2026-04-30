---
name: are-you-in-prompting
description: Design, review, and refactor Are You In narrative prompts and LLM context. Use when working on prompt files, staged reveal logic, Day 1 gameplay context, connected-path narration, YES/NO consequences, drone/package/orb/ASI reveal timing, prompt validators, or any bug where the model foreshadows hidden future story facts.
---

# Are You In Prompting

## Principle

Keep prompts stage-scoped. Give the model only facts the player can perceive in the current beat plus the minimum server-side outcome it must narrate now. Do not give future reveal facts and then ask the model not to mention them.

Use validators as a final guardrail, not as the primary hiding mechanism.

## Workflow

1. Inventory the prompt surface with `rg -n "generateText|createPlayerFacingNarrativePrompt|day1GameplayContext|promptExtras|globalTruth|rumors|drone|package|orb|ASI" lib app convex`.
2. Identify the current player-visible stage before editing a prompt.
3. Build or adjust the prompt payload so hidden canonical facts remain outside the LLM context.
4. Replace broad story-bible payloads with small stage-specific context objects.
5. Keep deterministic state transitions in code, then pass only the outcome that should be narrated now.
6. Add validators only after context minimization, especially for reveal boundaries.
7. Verify with `pnpm build` and, when practical, a targeted generated-output smoke test.

## Context Rule

Before adding any field to an LLM prompt, ask:

- Can the player perceive this right now?
- Does the model need this exact fact to narrate the current action?
- Would this fact spoil a later reveal if mentioned by presence, absence, metaphor, or negation?

If the answer to the third question is yes, do not pass it. Keep it in deterministic code or persistence only.

## Stage Matrix

Read [stage-context-matrix.md](references/stage-context-matrix.md) when editing Day 1 prompts, connected-path prompts, or shared context builders.

Default rule by stage:

- Opening: local moment, player-provided activity, selected device only.
- YES/NO reveal: current device and fixed reveal copy only.
- Immediate YES consequence: ordinary world resumes; no delivery vocabulary.
- Early NO or public lookup: public confusion and uncertainty; no verified personal delivery facts.
- Pre-delivery YES waiting: YES was chosen and nothing direct is visible yet; no drone/package/orb/box/delivery terms, including hidden status labels.
- Delivery beat: first point where drone and package facts may enter prompt context.
- Package opened: first point where orb facts may enter prompt context.
- Orb accepted: first point where ASI interface facts may enter prompt context.

## Code Patterns

Prefer stage-specific builders:

```ts
const promptContext = buildPreDeliveryYesPromptContext({ player, actionText });
```

Avoid generic payloads that carry story-bible truth into every prompt:

```ts
// Avoid for early-stage narration.
{ day1GameplayContext, day1MediaContext, transition }
```

When deterministic code computes hidden state, pass player-facing labels instead of raw internal status:

```ts
// Better: no hidden nouns before reveal.
{ currentBeat: "waiting_after_yes", visibleResult: "no_direct_change_yet" }
```

Avoid:

```ts
{ deliveryStatus: "pending", packageStatus: "not_arrived", orbStatus: "unknown" }
```

## Review Checklist

- No prompt receives `globalTruth`, `rumors`, `socialFeedSignals`, or `phases` wholesale unless the stage truly needs them.
- No pre-reveal prompt receives raw `firstConnectedPath`, `transition`, `deliveryStatus`, `packageStatus`, `orbStatus`, or `orbLifecycle`.
- No prompt instruction says "do not mention X" while the prompt payload contains X.
- Public media context is split by stage, so early feeds cannot see later drone/package/orb rumors.
- `playerVisibleFacts` cannot persist hidden internal state labels.
- Validators check output and facts, but their forbidden terms are not present in prompt inputs.
- Tests or smoke examples include negative foreshadowing cases such as "no package," "no drone shadow," and "nothing waiting outside."
