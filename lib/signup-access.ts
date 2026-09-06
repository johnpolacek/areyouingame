import { headers } from "next/headers";
import { isSignupEnabledForHost } from "./signup-access-shared";

export { isSignupEnabledForHost, signupDisabledMessage } from "./signup-access-shared";

export async function isSignupEnabledForRequest(): Promise<boolean> {
  const headerStore = await headers();

  return isSignupEnabledForHost(headerStore.get("host"));
}
