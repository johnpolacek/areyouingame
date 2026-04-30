import { headers } from "next/headers";
import { notFound } from "next/navigation";

const localAdminHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export async function requireLocalAdminAccess() {
  const headerStore = await headers();
  const host = headerStore.get("host");

  if (!isLocalAdminHost(host)) {
    notFound();
  }
}

export function isLocalAdminHost(host: string | null): boolean {
  if (!host) {
    return false;
  }

  return localAdminHosts.has(normalizeHost(host));
}

function normalizeHost(host: string): string {
  const trimmedHost = host.trim().toLowerCase();

  if (trimmedHost.startsWith("[::1]")) {
    return "[::1]";
  }

  return trimmedHost.split(":")[0] || "";
}
