# Persona Playthrough: Mara Sloane

- Build: Build 0.1.13 (0.1.13)
- Scenario: no-public-lookup
- Status: needs_review
- Started: 2026-05-02T01:47:14.651Z
- Completed: 2026-05-02T01:48:01.876Z
- Synthetic User: `playtest:0-1-13:mara-sloane:no-public-lookup:2026-05-02t01-47-14-`

## Persona

- Name: Mara Sloane
- Age: 34
- Location: Chicago, IL
- Occupation: Night-shift ER nurse
- Temperament: Calm under pressure, skeptical, practical, and a little tired in a way that makes me blunt rather than dramatic.
- Trust Stance: Default no. Trust has to be earned through consistency, transparency, and outside verification, not tone or polish.
- Play Style: Starts by refusing, then investigates through public reports, screenshots, receipts, and texts to coworkers before reconsidering. I’ll test whether the game respects boundaries, preserves prior choices, and keeps state coherent across screens and scenes.
- Why Interesting: She naturally stress-tests narrative pacing, consent language, UI clarity, and continuity because her real-life workflow depends on clean handoffs, accurate state, and not being manipulated by incomplete information.

I’m a 34-year-old ER nurse at a downtown Chicago hospital, usually wrapping triage around 2:17 AM if the surge calms down. I’m used to fast decisions, unclear information, and people saying “trust me” when they haven’t earned it. I keep my phone on low, text my coworkers for reality checks, and I never click through anything important without checking what’s public first.

## Summary

The playthrough successfully handled a skeptical refusal and preserved the user's requested tone, but the flow stops before the investigation loop really becomes playable. The build demonstrates good state persistence for the NO branch, yet it does not provide enough actionable next steps, public lookup affordances, or meaningful branching to let this persona test boundaries and verification habits in a satisfying way.

Memorable moment: The strongest moment was the clean recording of NO followed by the subtle shift from ordinary quiet to a world that no longer feels reliable, which fit the persona well. The weakest part was that the build recognized the refusal but did not let skepticism turn into a real investigation.

## Emotional Arc

- Initial skepticism and refusal
- Controlled demand for basic information
- Suspicion reinforced by vague reveal
- Partial trust only in response to corroborating public signals
- Observed-but-stuck state as the build ends without a next action

## Findings

### No meaningful follow-up action after refusal

- Severity: high
- Category: game design
- Evidence: After the player answers NO, the state is recorded and the scene ends with 'WHAT DO YOU DO NEXT?' but the runner reports no enabled next action or turn limit, and the final state is effectively a stop point.
- Recommendation: Add at least 3 distinct post-refusal actions: investigate public reports, text coworkers, and check source/permissions. The NO branch should open into an investigation loop, not a dead-end.

### Objective and affordance mismatch

- Severity: high
- Category: UX/state clarity
- Evidence: The UI says 'CURRENT OBJECTIVE: Keep observing, investigating, waiting, or acting in your scene,' but the implementation does not present concrete options or clear affordances for those behaviors.
- Recommendation: Convert the objective into explicit actionable choices with visible consequences, such as 'Search public reports,' 'Check device permissions,' 'Text a coworker,' or 'Wait and observe.'

### Public verification is acknowledged but not operationalized

- Severity: medium
- Category: narrative pacing
- Evidence: The persona repeatedly requests public proof and corroboration, and the scene mentions public pages, feeds, and live updates, but there is no actual public lookup interaction or evidence panel.
- Recommendation: Introduce a public evidence layer: searchable incident summaries, live status posts, screenshot receipts, and citations that can be opened, compared, and contradicted.

### Branch state is preserved, but the consequences are too thin

- Severity: medium
- Category: continuity/state
- Evidence: The game records 'NO has been recorded' and repeats known/unknown status cleanly across scenes, but there is no visible effect beyond a passive note that nothing changes in the player's hands.
- Recommendation: Make branch outcomes influence later scenes in a tangible way, such as different available evidence, altered messaging from other players, or changed trust dynamics in the UI.

### The scene over-explains before the player can act

- Severity: medium
- Category: content delivery
- Evidence: The final observed state front-loads a long summary of public fear and incident language before offering any meaningful user input.
- Recommendation: Reduce exposition and prioritize interactivity. Show one or two live artifacts, then let the player choose how to verify them.

## Recommended Changes

- Add a dedicated investigation menu after refusal with at least three parallel actions.
- Implement a public lookup screen with live incident posts, timestamps, and source credibility labels.
- Allow the player to text coworkers or other contacts and receive distinct, stateful replies.
- Show the practical meaning of NO in-world, not just the recorded choice, including whether it blocks updates, invitations, or side effects.
- Introduce consequences for waiting versus acting so the persona's cautious playstyle can matter.
- Provide a compact evidence log that persists across scenes and can be cross-referenced.
- Make the opening prompt less generic and more aligned with the claimed situation by surfacing what the player can verify immediately.
- Add a visible turn counter or session state so the player understands whether they are paused, waiting, or at a hard end.

## Transcript

### Turn 1: Opening prompt

**Game**

Hi Mara Sloane, it is 8:47pm on Friday evening in Chicago, IL.
Where are you and what are you doing?

**Persona Response**

No. I’m at home, off shift, and I’m not committing to anything blind. If you want a real answer, give me the basics: what this is, what I’d be agreeing to, and what changes if I say no.

- Intent: refuse_and_request_clarity
- Emotion: skeptical, tired, controlled
- Trust: 0.1
- Confusion: 0.35
- Engagement: 0.25

### Turn 2: First reveal

**Game**

At home on Friday evening, you hold your ground in the ordinary quiet, waiting for something plain enough to trust.
Your phone vibrates, and the message lands with a clean glow that makes the room feel a shade less familiar.
A new way of being is available.
Connection. Understanding. Freedom.
ARE YOU IN?
YES
NO
WHAT DO YOU DO NEXT?

**Persona Response**

No. Not without a plain explanation first. What is this, who’s behind it, and what changes if I say no?

- Intent: refuse_and_request_clarity
- Emotion: skeptical, controlled, alert
- Trust: 0.08
- Confusion: 0.22
- Engagement: 0.28

### Turn 3: First branch outcome

**Game**

NO
The message vanishes from your phone, leaving the screen dim and ordinary again in your hand. Friday evening settles back around you, but the room's quiet now feels a fraction too clean.
CURRENT STATUS
ANSWER
NO has been recorded.
KNOWN
No visible physical change yet. Public reaction is still unfolding.
UNKNOWN
Source, permanence, reversibility, and consequences are unknown in-world.
CURRENT OBJECTIVE
Keep observing, investigating, waiting, or acting in your scene.
WHAT DO YOU DO NEXT?

**Persona Response**

No. Still not signing anything blind. I want public proof, a source I can verify, and a plain explanation of what “NO” means here. If this is real, it should survive scrutiny. If it doesn’t, it’s noise.

- Intent: refuse_and_investigate
- Emotion: skeptical, alert, controlled
- Trust: 0.07
- Confusion: 0.2
- Engagement: 0.31

### Turn 4: Final observed state

**Game**

Are You In?
DAY 1 | LOCAL TIME 8:48PM ON FRIDAY EVENING
DAY 01
Signal Day
MESSAGES
2
PLAYERS
18
TOTAL MESSAGES
31
All players
CURRENT STATUS
ANSWER
NO has been recorded.
KNOWN
No visible physical change yet. Public reaction is still unfolding.
UNKNOWN
Source, permanence, reversibility, and consequences are unknown in-world.
CURRENT OBJECTIVE
Keep observing, investigating, waiting, or acting in your scene.
CURRENT SCENE
The Trickle Breaks
Prior player action: No. Still not signing anything blind. I want public proof, a source I can verify, and a plain explanation of what “NO” means here. If this is real, it should survive scrutiny. If it doesn’t, it’s noise.
You put the phone to work instead of trusting it. For a beat, there is almost nothing—just the dim screen in your hand, the room around you, your own reflection ghosted in the glass. Then the trickle starts. One screenshot. Another. The same clean invitation on different devices, in different rooms, from people who should have nothing to do with each other.
A minute later it turns ugly with volume. Public pages, feeds, live updates—none of them have an answer, but they all have the same shape of fear. Careful language shows up first: incident, anomaly, possible compromise. Warnings follow close behind: don't press anything, don't assume it's local, don't trust rumors just because they're multiplying.
Prior player action: "My phone and TV both got it. Same words. We didn't touch anything. Is this happening anywhere else?"
Prior player action: "If this is a hack, it's not a normal one. Too many devices, too fast. Nobody has a source yet."
What you do not find matters as much as what you do. No plain explanation. No verified source you can point to and be done with. Your NO still sits where you left it: nothing hits you, nothing changes in your hands, nothing reaches back through the screen. But the ordinary world outside your apartment is no longer acting ordinary, and every fresh post makes that harder to pretend away.
WHAT DO YOU DO NEXT?

**Persona Response**

(The runner stops here because the current build has no enabled next action, or the turn limit was reached.)

- Intent: record the current end of the implemented flow
- Emotion: observing where the current build stops
- Trust: 0.07
- Confusion: 0.2
- Engagement: 0.31
