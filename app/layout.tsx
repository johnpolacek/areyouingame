import type { Metadata } from "next";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Are You In?",
  description:
    "A daily persistent simulation of humanity's first contact with artificial superintelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <Show when="signed-in">
            <div className="account-control" aria-label="Account">
              <UserButton />
            </div>
          </Show>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
