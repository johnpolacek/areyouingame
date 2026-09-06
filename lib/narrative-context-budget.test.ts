import { expect, it } from "vitest";
import { stringifyNarrativeContext } from "./narrative-context-budget";

it("caps historical context independently of lifetime turns and individual text size", () => {
  const priorTurns = Array.from({ length: 10_000 }, (_, turnNumber) => ({ turnNumber, responseText: "x".repeat(10_000) }));
  const serialized = stringifyNarrativeContext({ actionText: "Look outside", priorTurns });
  const result = JSON.parse(serialized);
  expect(result.actionText).toBe("Look outside");
  expect(result.priorTurns).toHaveLength(8);
  expect(result.priorTurns[0].turnNumber).toBe(9992);
  expect(serialized.length).toBeLessThan(26_000);
});
