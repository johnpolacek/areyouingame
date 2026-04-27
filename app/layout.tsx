import type { Metadata } from "next";
import { Rethink_Sans, Rubik_80s_Fade, Stalinist_One } from "next/font/google";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { CommandEnterSubmit } from "./command-enter-submit";
import "./globals.css";

const rethinkSans = Rethink_Sans({
  subsets: ["latin"],
  variable: "--font-rethink-sans",
});

const stalinist = Stalinist_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-stalinist",
});

const rubik80sFade = Rubik_80s_Fade({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-rubik-80s-fade",
});

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
      <body
        className={`${rethinkSans.variable} ${stalinist.variable} ${rubik80sFade.variable} bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950`}
      >
        <ClerkProvider>
          <CommandEnterSubmit />
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
