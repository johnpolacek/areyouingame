# Stage 05, Unit 06: First Connected ASI Interaction

Allow a YES player who accepted the orb to take the first open-text action through the connected ASI interface.

Status: completed.

## Product Intent

Orb acceptance should not end play at a threshold beat. The next action is the first actual connected interaction: the player can ask what is happening, ask what the ASI can do, set a boundary, reach toward another connected presence, or request help.

The experience should follow the connected ASI response guide: quiet widening, consent-centered capability framing, soft human-node awareness, and no automatic omniscience or broad powers.

## Scope

- Add a guarded connected-ASI action route after `orbLifecycle: orb_accepted`.
- Generate the first connected ASI response through the AI SDK boundary.
- Ground the response in player context, Day 1 storyline context, prior YES/orb state, and the connected ASI response guide.
- Persist the connected ASI turn under the existing connected path.
- Append event-history records for the first connected ASI interaction and interface start.
- Render the first connected ASI turn in the existing transcript and then pause at the next-turn placeholder.

## Out Of Scope

- Full connected cognition, multi-turn connected play, or long-term capabilities.
- Real multiplayer connected nodes.
- Automatic Tier 3 or Tier 4 actions.
- Device, account, sensor, platform, or infrastructure integrations.
- New UI status chips or debug state.

## Acceptance Criteria

- A YES player with `orbLifecycle: orb_accepted` can submit one connected ASI action.
- A NO player, pre-orb YES player, `orb_delivered` player, or `orb_lost` player cannot access the route.
- The response is persisted and refresh-safe.
- Duplicate submissions for the same expected connected ASI turn are idempotent.
- The response uses gentle consent-centered ASI framing instead of a power dump.
- Human node awareness does not expose names, private memories, exact locations, or readable thoughts.
- Event history records `connected_asi_interface_started` and `connected_asi_interaction_resolved` separately from transcript prose.
- The UI shows the accepted player an open action prompt, then returns to the quiet next-turn placeholder after the first connected ASI interaction.

## Data And State Notes

- `firstConnectedPath.connectedAsiTurns` stores the first connected ASI transcript turn.
- `firstConnectedPath.connectedAsiStartedAt` records when the connected ASI interface first became active through a player action.
- `gameplayEvents` stores connected ASI interaction history with the current delivery, package, orb, and lifecycle state.
- The ASI response can describe available data and capability tiers, but structured state remains the source of enforceable truth.

## Implementation Notes

- Added a `first-connected-asi-action` API route gated by Clerk and `orbLifecycle: orb_accepted`.
- Added a `createFirstConnectedAsiTurnResponse` AI SDK boundary with embedded connected ASI guide constraints.
- Extended Convex player state with `connectedAsiTurns` and `connectedAsiStartedAt`.
- Added `connected_asi_interface_started` and `connected_asi_interaction_resolved` event types.
- Updated the post-choice UI so orb acceptance opens one connected ASI action prompt before pausing.

## Verification

- Run TypeScript and production build checks.
- Manually verify an accepted orb player can submit a first connected ASI action and see it in the transcript.
- Manually verify unavailable states cannot post to the connected ASI endpoint.
