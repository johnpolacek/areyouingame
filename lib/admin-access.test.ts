import { describe, expect, it } from "vitest";
import { isLocalAdminHost } from "./admin-access";

describe("isLocalAdminHost", () => {
  it("allows localhost hosts", () => {
    expect(isLocalAdminHost("localhost")).toBe(true);
    expect(isLocalAdminHost("localhost:3000")).toBe(true);
    expect(isLocalAdminHost("127.0.0.1:3000")).toBe(true);
    expect(isLocalAdminHost("[::1]:3000")).toBe(true);
  });

  it("blocks non-local hosts", () => {
    expect(isLocalAdminHost(null)).toBe(false);
    expect(isLocalAdminHost("areyouin.example")).toBe(false);
    expect(isLocalAdminHost("192.168.50.67:3000")).toBe(false);
  });
});
