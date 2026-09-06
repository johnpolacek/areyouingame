"use client";

import { createContext, useContext, type ReactNode } from "react";

const SignupAccessContext = createContext(false);

export function SignupAccessProvider({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  return (
    <SignupAccessContext.Provider value={enabled}>
      {children}
    </SignupAccessContext.Provider>
  );
}

export function useSignupEnabled(): boolean {
  return useContext(SignupAccessContext);
}
