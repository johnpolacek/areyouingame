import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  reserve: vi.fn(),
  generate: vi.fn(),
}));
vi.mock("@/lib/playtest-auth", () => ({ getOptionalAuthenticatedUserId: mocks.auth }));
vi.mock("@/lib/character-draft-quota", () => ({ reserveCharacterDraftGeneration: mocks.reserve }));
vi.mock("@/lib/character-draft-generation", () => ({
  fieldLimits: { name: 80, age: 3, location: 120, occupation: 120, appearance: 600, bio: 800 },
  generateCharacterDraftSuggestion: mocks.generate,
  mergeGeneratedCharacterDraft: (draft: object, suggestion: object) => ({ ...suggestion, ...draft }),
}));
import { POST } from "./route";

const request = (body: unknown) => new Request("http://localhost/api", {
  method: "POST", body: JSON.stringify(body),
});

describe("character draft generation safeguards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("user_1");
    mocks.reserve.mockResolvedValue({ allowed: true, retryAfter: 0 });
    mocks.generate.mockResolvedValue({ name: "Alex" });
  });

  it("rejects anonymous requests before reading input or reserving quota", async () => {
    mocks.auth.mockResolvedValue(null);
    expect((await POST(request({}))).status).toBe(401);
    expect(mocks.reserve).not.toHaveBeenCalled();
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it.each([
    { draft: { bio: "x".repeat(801) } },
    { draft: { name: " ".repeat(81) } },
    { draft: { age: 30 } },
    { draft: [] },
    null,
    { ignored: "x".repeat(16_384) },
  ])("rejects invalid or oversized input before reserving quota: %j", async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(mocks.reserve).not.toHaveBeenCalled();
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("does not trust content-length for streamed body limits", async () => {
    const req = request({ ignored: "x".repeat(16_384) });
    req.headers.set("content-length", "1");
    expect((await POST(req)).status).toBe(400);
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("returns retry information without generating when quota is exhausted", async () => {
    mocks.reserve.mockResolvedValue({ allowed: false, retryAfter: 60 });
    const response = await POST(request({}));
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("fails closed when the quota backend is unavailable", async () => {
    mocks.reserve.mockRejectedValue(new Error("secret backend details"));
    const response = await POST(request({}));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("secret");
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("reserves using the authenticated identity and generates bounded trimmed input", async () => {
    expect((await POST(request({ draft: { name: " Alex " }, clerkUserId: "spoof" }))).status).toBe(200);
    expect(mocks.reserve).toHaveBeenCalledWith("user_1");
    expect(mocks.generate).toHaveBeenCalledWith({ clerkUserId: "user_1", draft: { name: "Alex" } });
  });

  it("does not expose provider errors or retry failed generations", async () => {
    mocks.generate.mockRejectedValue(new Error("provider secret"));
    const response = await POST(request({}));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("secret");
    expect(mocks.reserve).toHaveBeenCalledTimes(1);
    expect(mocks.generate).toHaveBeenCalledTimes(1);
  });
});
