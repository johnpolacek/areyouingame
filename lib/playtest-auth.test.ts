import { describe, expect, it } from "vitest";
import { getPlaytestUserIdFromHeaders } from "./playtest-auth";

describe("getPlaytestUserIdFromHeaders", () => {
  it("accepts local development playtest users when explicitly enabled", () => {
    expect(
      getPlaytestUserIdFromHeaders({
        enabled: "1",
        host: "localhost:3000",
        mode: "development",
        playtestHeader: "1",
        userHeader: "playtest:0-1-2:teacher:day-1-opening-branch",
      }),
    ).toBe("playtest:0-1-2:teacher:day-1-opening-branch");
  });

  it("rejects production and non-local requests", () => {
    const input = {
      enabled: "1",
      host: "localhost:3000",
      mode: "production",
      playtestHeader: "1",
      userHeader: "playtest:0-1-2:teacher:day-1-opening-branch",
    };

    expect(getPlaytestUserIdFromHeaders(input)).toBeNull();
    expect(
      getPlaytestUserIdFromHeaders({
        ...input,
        host: "areyouin.example",
        mode: "development",
      }),
    ).toBeNull();
  });

  it("requires the playtest header and a safe synthetic id", () => {
    const input = {
      enabled: "1",
      host: "localhost:3000",
      mode: "development",
      playtestHeader: "1",
      userHeader: "user_real",
    };

    expect(
      getPlaytestUserIdFromHeaders({ ...input, playtestHeader: "0" }),
    ).toBeNull();
    expect(getPlaytestUserIdFromHeaders(input)).toBeNull();
  });

  it("rejects synthetic auth without the explicit server opt-in", () => {
    const input = {
      host: "localhost:3000",
      mode: "development",
      playtestHeader: "1",
      userHeader: "playtest:0-1-2:teacher:day-1-opening-branch",
    };

    expect(
      getPlaytestUserIdFromHeaders({ ...input, enabled: undefined }),
    ).toBeNull();
    expect(getPlaytestUserIdFromHeaders({ ...input, enabled: "0" })).toBeNull();
    expect(getPlaytestUserIdFromHeaders({ ...input, enabled: "true" })).toBeNull();
  });
});
