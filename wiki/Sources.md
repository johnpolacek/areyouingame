# Sources

This page captures the human-facing source context that informed this project during the guided plan interview.

## Current Sources

- Guided plan interview summary recorded by MarkdownStack.
- Connected ASI response direction captured in [`reference/connected-asi-response-guide.md`](reference/connected-asi-response-guide.md).

## Interview Notes

- What we are building: AreYouIn is a persistent, real-time, AI-driven global simulation about humanity's first contact with artificial superintelligence. Players enter one shared timeline, make the defining YES/NO choice, and act through natural language as the world evolves day by day.

The product depends on a strict separation between canonical world state, immutable event history, and narrative wiki memory. The LLM serves as game master and narrator, while structured systems preserve coherence, consequence, and long-term continuity.
- Preferred build direction: Next.js + TypeScript + AI SDK + Convex for live state + S3 flat-file artifact storage + pnpm

## Preserved Paths

- Supporting source files live under `wiki/sources/` when exact wording matters.
- Raw originals belong under `wiki/sources/raw/`.
