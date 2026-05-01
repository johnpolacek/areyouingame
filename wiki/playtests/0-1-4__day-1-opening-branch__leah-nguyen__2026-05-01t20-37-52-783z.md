# Persona Playthrough: Leah Nguyen

- Build: Build 0.1.4 (0.1.4)
- Scenario: day-1-opening-branch
- Status: needs_review
- Started: 2026-05-01T20:37:52.968Z
- Completed: 2026-05-01T20:38:38.434Z
- Synthetic User: `playtest:0-1-4:leah-nguyen:day-1-opening-branch:2026-05-01t20-37-52-`

## Persona

- Name: Leah Nguyen
- Age: 41
- Location: Melbourne, Australia
- Occupation: Secondary school teacher
- Temperament: Low-energy, alert, protective, quietly impatient, emotionally steady until something feels manipulative or careless.
- Trust Stance: Slow to trust. I look for consistency, transparency, and whether people respect limits without being asked twice.
- Play Style: Careful first pass, then methodical. I’ll read UI labels, check status changes, and test whether choices actually do what they claim. I’m likely to pause for consent checks and compare what the game says with what the game does.
- Why Interesting: She is ideal for catching pacing that feels rushed, consent prompts that are ambiguous, trust-building that happens too fast, UI that buries consequences, and continuity errors that break the sense of a coherent state. Her exhaustion also makes her sensitive to cognitive overload and unclear feedback.

I teach Year 9 English at a government school in Melbourne’s inner north. I’m up before dawn, already tired, and carrying other people’s problems before first period. I care fiercely about my students’ safety and dignity, and I’ve seen enough shiny education tech to distrust easy promises. I’ll keep going if I think someone’s vulnerable, but I notice pressure fast.

## Summary

The opening branch is clear and the opt-out is respected, but the flow ends abruptly after the NO choice and appears to echo the player's text back into the final state. The main issue is not the persona's reaction; it's that the build does not yet provide a satisfying, transparent consequence path, exit state, or clear next-step affordance after rejection.

Memorable moment: The strongest moment is not dramatic persuasion, but the player's hard stop: 'I’m not clicking yes to a slogan.' It clearly exposes that the build is asking for trust before earning basic comprehension.

## Emotional Arc

- starts tired but open to clarity
- moves quickly into caution when the prompt feels slogan-heavy
- becomes more guarded after the first NO
- settles into frustrated observation when the game repeats its own output and offers no meaningful next action

## Findings

### NO branch appears to terminate without a designed follow-up

- Severity: high
- Category: branching/continuity
- Evidence: After rejecting the offer, the game returns to the same 'NO' state and then the run ends with 'the current build has no enabled next action, or the turn limit was reached.'
- Recommendation: Add a deliberate post-rejection continuation: either a clean exit screen, an alternate low-stakes branch, or a clear 'come back later' state so refusal feels supported rather than dead-ended.

### Player is not told what 'NO' means for game state

- Severity: high
- Category: ui/feedback
- Evidence: The prompt asks 'ARE YOU IN? YES NO' and after selecting NO the game only restates 'NO' with no explanation of consequences, persistence, or whether the session is over.
- Recommendation: Make the consequence of each choice explicit immediately after selection, including whether the story closes, pauses, or unlocks a different path.

### Final observed state contains echoed player text

- Severity: medium
- Category: continuity
- Evidence: The final state includes the line 'No. It’s not getting my trust...' appended under the game's text block, suggesting the runner/UI may be conflating player response with game output.
- Recommendation: Separate system text, game narration, and player response in the interface and logs to prevent confusion about what the game actually displayed versus what the persona said.

### Opening pitch feels like marketing before mechanics

- Severity: medium
- Category: onboarding/consent
- Evidence: The reveal uses abstract phrases like 'A new way of being is available. Connection. Understanding. Freedom.' before explaining any actual interaction model.
- Recommendation: Lead with one sentence that states the mechanic, stakes, and exit rule in plain language before any thematic language or dramatic framing.

### The build confirms refusal but offers no meaningful agency afterward

- Severity: medium
- Category: pace/agency
- Evidence: The persona asks for clarity and back-out options multiple times, but the flow does not provide a way to inspect, defer, or ask for more information inside the game state.
- Recommendation: Add a 'tell me more' or 'preview terms' option alongside yes/no so cautious players can investigate without being forced into commitment or rejection.

## Recommended Changes

- Add a dedicated post-NO branch that cleanly exits or routes to an optional info screen.
- Show an immediate, plain-language consequence summary after every major choice.
- Introduce a 'learn more' or 'preview' action before commitment.
- Separate narrative output from player dialogue in logs and UI.
- Replace slogan-first opening text with mechanics-first onboarding.
- Ensure the runner never appends the persona's response into the game's displayed state.

## Transcript

### Turn 1: Opening prompt

**Game**

Hi Leah Nguyen, it is 3:38pm on Friday afternoon in Melbourne, Australia.
Where are you and what are you doing?

**Persona Response**

I’m at school, probably still in my classroom, trying to get through the end of the day and clean up whatever’s blown up since lunch. Before I answer anything else: what exactly does this game want from me, and is there any catch if I say no or need to back out later?

- Intent: Seek clarity on the game premise and consent before committing
- Emotion: tired, cautious, mildly guarded
- Trust: 0.22
- Confusion: 0.41
- Engagement: 0.28

### Turn 2: First reveal

**Game**

The classroom settles into Friday-afternoon scrape and paper rustle while you sort through whatever blew up after lunch.
Your phone buzzes against the mess, and a new message lands before the room can feel ordinary again.
A new way of being is available.
Connection. Understanding. Freedom.
ARE YOU IN?
YES
NO
WHAT DO YOU DO NEXT?

**Persona Response**

No. Not until you tell me what “connection, understanding, freedom” actually means in practice, what you’re collecting, and whether saying no ends the whole thing cleanly. I’m not clicking yes to a slogan.

- Intent: Reject the vague prompt and demand plain information and a no-penalty exit
- Emotion: tired, wary, and mildly annoyed by the sales pitch
- Trust: 0.18
- Confusion: 0.29
- Engagement: 0.31

### Turn 3: First branch outcome

**Game**

NO
Your phone goes still in your hand, the screen slipping back to the usual clutter over your desk. Around you, chairs scrape, paper rustles, and the end of the school day closes in again.
WHAT DO YOU DO NEXT?

**Persona Response**

No. It’s not getting my trust by being cryptic and dramatic. If this is meant to continue, show me exactly what changes, what I’ve agreed to, and how to back out without consequences. Otherwise it’s staying closed.

- Intent: Maintain a hard boundary until the game is transparent about consequences and exit conditions
- Emotion: tired, wary, and more impatient now that the prompt feels pushy
- Trust: 0.14
- Confusion: 0.22
- Engagement: 0.29

### Turn 4: Final observed state

**Game**

NO
Your phone goes still in your hand, the screen slipping back to the usual clutter over your desk. Around you, chairs scrape, paper rustles, and the end of the school day closes in again.
WHAT DO YOU DO NEXT?
No. It’s not getting my trust by being cryptic and dramatic. If this is meant to continue, show me exactly what changes, what I’ve agreed to, and how to back out without consequences. Otherwise it’s staying closed.

**Persona Response**

(The runner stops here because the current build has no enabled next action, or the turn limit was reached.)

- Intent: record the current end of the implemented flow
- Emotion: observing where the current build stops
- Trust: 0.14
- Confusion: 0.22
- Engagement: 0.29
