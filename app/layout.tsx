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
      <body className="bg-[linear-gradient(145deg,oklch(0.09_0.012_255)_0%,oklch(0.17_0.016_250)_48%,oklch(0.11_0.01_255)_100%)]">
        <ClerkProvider>
          <Show when="signed-in">
            <div
              className="fixed top-5 right-5 z-10 inline-flex"
              aria-label="Account"
            >
              <UserButton />
            </div>
          </Show>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
