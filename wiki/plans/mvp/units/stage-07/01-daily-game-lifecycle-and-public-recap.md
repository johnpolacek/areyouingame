# Stage 07, Unit 01: Daily Game Lifecycle And Public Recap

Create the lifecycle for accumulating daily games and producing public end-of-day recaps.

## Product Intent

Every global day starts a new game, but prior games persist. The archive grows over time: launch day has one active game, the next day has two persisted games, and each later day adds another daily game. During the day, player chats are private. At the end of the day, the game produces a public recap that summarizes meaningful shared outcomes.

## Scope

- Resolve or create one daily game per global date.
- Assign each daily game a stable start-date id.
- Store a global event time that can vary by day.
- Display the event time to players in their local timezone where relevant.
- Track daily game status through open, recap-pending, and recapped states.
- Generate or support creation of an end-of-day public recap.
- Preserve recapped games as public archive entries.

## Out Of Scope

- Raw private chat publication.
- Full automated world simulation for every recap.
- Advanced archive search or filtering.
- Multi-timezone daily rollover policy beyond the chosen global standard.

## Acceptance Criteria

- The same global date always resolves to the same daily game id.
- A new global day creates or resolves a new daily game without deleting older games.
- Daily games remain accessible after their start day.
- Each daily game stores an event time that can be rendered in user-local time.
- End-of-day recap content is visible publicly.
- Recap content summarizes results without exposing private raw chat by default.

## Data And State Notes

- Daily game ids should be derived from a normalized global start date.
- Recap records should link to the daily game id and preserve generated or manually approved summary content.
- Events and player actions should remain auditable for operators even when public recap copy is summarized.

## Verification

- Test date-to-game-id stability.
- Test previous daily games remain after a new day starts.
- Test recap visibility separately from private chat visibility.
- Test public recap rendering for a completed daily game.

## Manual Steps

- Confirm the global timezone standard for date ids.
- Confirm whether the event time is random within a configured window or any time in the global day.
- Confirm whether first recap generation is manual, template-based, or LLM-assisted.
