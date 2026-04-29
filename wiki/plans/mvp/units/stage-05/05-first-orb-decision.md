# Stage 05, Unit 05: First Orb Decision

Add the first playable decision after a YES player opens the package and reveals the orb.

Status: completed.

## Product Intent

The package reveal should not immediately skip into full connected cognition. Once the orb is visible, the player has a new open-text decision surface: place it at the center of their forehead, reject or lose it, or keep interacting with it while it remains available.

This unit makes the orb threshold durable without inventing extra states. The canonical lifecycle has exactly three values:

- `orb_delivered` - the package has been opened, the orb has been revealed, and the orb remains available.
- `orb_accepted` - the player places the orb at the center of their forehead.
- `orb_lost` - the player destroys it, throws it away, gives it away, runs from it, abandons it, or otherwise makes it unavailable.

## Scope

- Add `orbLifecycle` as the canonical connected-path threshold state.
- Preserve `deliveryStatus`, `packageStatus`, and `orbStatus` as physical/logistics detail from Unit 04.
- Add an orb-decision action route after `packageStatus: opened` and `orbStatus: revealed`.
- Keep the interaction open-text only; do not add YES/NO-style buttons.
- Deterministically classify explicit acceptance and loss/rejection phrases before narrative generation.
- Continue non-final orb actions while keeping `orbLifecycle: orb_delivered`.
- Stop `orb_accepted` at the first connected threshold beat.
- Treat `orb_lost` as NO-equivalent/unconnected for current gameplay while preserving that the player originally answered YES and lost or rejected the orb.
- Persist orb-decision transcript turns and append-only lifecycle events separately from prose.

## Out Of Scope

- Full connected cognition, shared awareness, powers, or long-term ASI interface behavior after acceptance.
- Recovering a lost orb in the same unit.
- NO player switching into YES from public footage.
- A new `decision_deferred` lifecycle state.
- UI status chips for lifecycle/debug state.

## Acceptance Criteria

- A YES player with an opened package and revealed orb can submit an orb action.
- A player before orb reveal cannot access the orb-action route.
- A NO player cannot access the orb-action route.
- Explicit forehead/instruction phrases resolve to `orb_accepted`.
- Destroy, smash, throw away, give away, run away, or abandon actions resolve to `orb_lost`.
- Livestream, chat, inspect, wait, or temporary hide actions remain `orb_delivered`.
- Refresh preserves lifecycle and transcript.
- Duplicate submissions after `orb_accepted` or `orb_lost` are idempotent.
- Event history records `orb_action_resolved`, `orb_accepted`, and `orb_lost` separately from narrative prose.

## Data And State Notes

- `orbLifecycle` is the canonical threshold field for current gameplay.
- `deliveryStatus`, `packageStatus`, and `orbStatus` remain physical/detail fields.
- `orbDecisionTurns` stores player action text, generated response text, lifecycle result, player-visible facts, model/source metadata, context source version, and timestamps.
- Gameplay events store lifecycle changes separately from transcript prose.

## Implementation Notes

- Added optional `orbLifecycle`, `orbDecisionTurns`, `orbAcceptedAt`, and `orbLostAt` to the Convex `firstConnectedPath` record.
- Added `orb_action_resolved`, `orb_accepted`, and `orb_lost` event types with optional `connectedOrbLifecycle`.
- Added a Clerk-protected first orb-decision route that only accepts YES players with opened package, revealed orb, and current `orb_delivered` lifecycle.
- Added deterministic orb action classification for acceptance, loss/rejection, and non-final delivered-state actions.
- Updated the post-choice UI so orb reveal continues into an open text action form until the lifecycle becomes accepted or lost.
- Updated Day 1 gameplay context so lifecycle and recent orb-decision actions are available to later narration.

## Verification

- Run TypeScript and production build checks.
- Manually verify a YES player can open the package, reveal the orb, continue with non-final orb actions, and then accept or lose it.
- Manually verify a NO player and a pre-reveal YES player cannot post to the orb-decision endpoint.
