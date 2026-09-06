import { describe, expect, it, vi } from "vitest";
import { classifyOrbDecisionAction } from "./first-orb-decision-response";

vi.mock("./early-post-choice-turn-response", () => ({
  createEarlyPostChoiceTurnResponse: vi.fn(),
}));

describe("classifyOrbDecisionAction", () => {
  it.each([
    "I do not put the orb on my forehead.",
    "I will not destroy the orb.",
    "What happens if I put the orb on my forehead?",
    "I don't put the orb on my forehead.",
    "I won’t destroy the orb.",
    "Never destroy the orb.",
    "Do I put the orb on my forehead",
    "Should I destroy the orb?",
    "If I put the orb on my forehead, what happens",
    "I put the orb on my forehead if it is safe.",
    "I would destroy the orb.",
    "Maybe I put the orb on my forehead.",
    "I consider whether to destroy the orb.",
    "I imagine picking it up and destroy the orb.",
    'I say "put the orb on my forehead".',
    "The note says to put the orb on my forehead.",
    "I ask chat to destroy the orb.",
    "I pretend to destroy the orb.",
    "I refuse to follow what the note says.",
    "I inspect the orb.",
  ])("keeps the orb available for uncommitted input: %s", (input) => {
    expect(classifyOrbDecisionAction(input)).toBe("orb_delivered");
  });

  it.each([
    "I put the orb on my forehead.",
    "Place it at the center of my forehead.",
    "I will press the orb against my forehead.",
    "I’ll put it on my forehead.",
    "I follow what the note says.",
    "I do what the instruction tells me.",
    "What will happen? I put the orb on my forehead.",
    "I will not destroy the orb. I put it on my forehead.",
  ])("accepts a committed action: %s", (input) => {
    expect(classifyOrbDecisionAction(input)).toBe("orb_accepted");
  });

  it.each([
    "I destroy the orb.",
    "Smash it.",
    "I will throw the orb away.",
    "I give it to my neighbor.",
    "I flee from the orb.",
    "I get rid of it.",
    "I do not put it on my forehead. I destroy the orb.",
  ])("loses the orb for a committed action: %s", (input) => {
    expect(classifyOrbDecisionAction(input)).toBe("orb_lost");
  });
});
