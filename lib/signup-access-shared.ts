export const signupDisabledMessage =
  "Sign ups are not open yet. Check back soon.";

const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function isSignupEnabledForHost(host: string | null): boolean {
  if (!host) {
    return false;
  }

  const trimmedHost = host.trim().toLowerCase();
  const normalizedHost = trimmedHost.startsWith("[::1]")
    ? "[::1]"
    : trimmedHost.split(":")[0] || "";

  return localHosts.has(normalizedHost);
}
