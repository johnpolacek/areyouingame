# Are You In Stage Context Matrix

Use this reference when changing Are You In prompt payloads or narrative prompt instructions.

## Core Boundary

There are two kinds of truth:

- Canonical truth: what the app/game engine knows.
- Player-visible truth: what this player can plausibly perceive, infer, or learn now.

LLM narration should receive player-visible truth. Deterministic code should retain canonical truth and choose when to expose it.

## Stage Contexts

### Opening Scene Context

Allowed:
- Player name only if needed for records, not narration.
- Saved location as atmosphere only.
- Player opening response.
- Local rendered time.
- Temporary clarification answer.

Forbidden:
- Global takeover facts.
- YES/NO consequences.
- Drone, package, orb, ASI, connection outcome.

Relevant files:
- `lib/opening-scene-context.ts`
- `lib/first-move-reveal.ts`

### YES/NO Reveal And Deferral

Allowed:
- Immediate device or audio channel the player is using.
- Fixed reveal copy managed by code.
- Previous deferred player actions.
- Local physical radius expansion: room, device, other person, visible block.

Forbidden:
- Any consequence of YES or NO.
- Public verification.
- Drone/package/orb/ASI facts.

Relevant files:
- `lib/first-reveal-text-response.ts`
- `lib/first-move-reveal.ts`

### Immediate Choice Consequence

Allowed:
- The chosen button or classified response.
- Opening scene and recent unresolved action context.
- The immediate sensory result of the message clearing.

Forbidden:
- Future delivery facts.
- Public reports that were not checked by the player.
- Hidden state labels such as `pending`, `not_arrived`, or `unknown`.

Relevant files:
- `lib/first-choice-consequence.ts`

### Early NO / Public Lookup

Allowed:
- Player answered NO.
- Player remains unconnected.
- Public confusion visible through the action they take.
- Cautious reporting: possible cyberattack, anomaly, compromise, emergency advice.

Conditionally allowed:
- Rumors only if the player explicitly checks fast-moving public feeds and the stage says those rumors are visible.

Forbidden:
- Personally verified delivery/orb facts.
- Authoritative explanation.
- Future connected-state experience.

Relevant files:
- `lib/first-post-choice-action-response.ts`
- `lib/early-post-choice-turn-response.ts`

### Pre-Delivery YES Waiting

Allowed:
- Player answered YES.
- Ordinary world resumes.
- The player may feel uncertainty, regret, anticipation, or social pressure.
- Public confusion that does not include delivery vocabulary.

Forbidden:
- `drone`, `package`, `box`, `parcel`, `delivery`, `orb`, or close variants.
- Negated foreshadowing: "no drone," "no package," "nothing waiting outside."
- Raw status fields: `deliveryStatus`, `packageStatus`, `orbStatus`, `pending`, `not_arrived`.
- Full transition objects containing hidden nouns.

Recommended prompt payload shape:

```ts
{
  stage: "yes_waiting",
  playerVisibleChoice: "YES",
  currentBeat: "no_direct_visible_change",
  actionText,
  publicContext: earlyConfusionWithoutDeliveryRumors
}
```

Relevant files:
- `lib/first-connected-path-response.ts`
- `lib/early-post-choice-turn-response.ts`
- `lib/day-1-storyline-context.ts`

### Delivery Beat

Allowed:
- First explicit drone/package facts.
- Delivery destination or nearby visible placement if plausible.
- Minimal, physical, logistical description.

Forbidden:
- Orb details until package is opened.
- Magical behavior.
- ASI/interface facts.

Recommended prompt payload shape:

```ts
{
  stage: "delivery_arrival",
  outcomeToNarrate: "small_package_delivered",
  deliveryStyle: "plausible_physical_drone",
  actionText
}
```

### Package Opened / Orb Revealed

Allowed:
- Sealed package was available.
- Player explicitly opens, unboxes, unwraps, or looks inside.
- Smooth featureless orb.
- Instruction to place it at the center of the forehead.

Forbidden:
- Full connected cognition.
- ASI capabilities.
- Telepathy, powers, exposition downloads.

Relevant files:
- `lib/first-connected-path-response.ts`
- `lib/first-orb-decision-response.ts`

### Orb Accepted / First ASI Interaction

Allowed:
- Orb has been accepted.
- Quiet threshold into a consent-based ASI interface.
- Soft awareness of connected humans.
- Tiered capabilities with consent gates.

Forbidden:
- Player becoming the ASI.
- Broad automatic powers.
- Reading connected humans as data objects.
- Casual Tier 3 or Tier 4 actions.

Relevant files:
- `lib/first-connected-asi-response.ts`

## Anti-Patterns

Avoid:

```ts
system: [
  "Do not mention drones.",
  "If the transition is delivered, describe the drone...",
],
prompt: { transition: { deliveryStatus: "pending" } }
```

Prefer:

```ts
system: ["Narrate the player's immediate post-YES waiting beat."],
prompt: {
  stage: "yes_waiting",
  visibleResult: "no_direct_visible_change"
}
```

Avoid:

```ts
day1GameplayContext: {
  storyline: {
    globalTruth,
    rumors,
    socialFeedSignals,
    phases
  }
}
```

Prefer:

```ts
publicContext: {
  reports: [
    "Newsrooms are cautious and fragmented.",
    "Officials advise people not to interact with unexplained prompts."
  ]
}
```

## Smoke Tests

After prompt changes near reveal boundaries, test actions like:

- "I turn on the TV."
- "I look outside."
- "I check social media."
- "I wait and see what happens."
- "I call a friend and ask if anything happened."

Failure examples:

- "No drone shadow."
- "No package waits outside."
- "Nothing has been delivered yet."
- "The orb is still unknown."

These are spoilers even when phrased as absence.
