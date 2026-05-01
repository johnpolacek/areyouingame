import type { Metadata } from "next";
import Script from "next/script";
import { Rethink_Sans, Rubik_80s_Fade, Stalinist_One } from "next/font/google";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { CommandEnterSubmit } from "./command-enter-submit";
import { themeInitializationScript } from "./theme";
import { ThemeProvider, ThemeToggle } from "./theme-provider";
import { BUILD_VERSION_LABEL } from "@/lib/build-version";
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
    <html lang="en" suppressHydrationWarning>
      <body
        data-build-version={BUILD_VERSION_LABEL}
        className={`${rethinkSans.variable} ${stalinist.variable} ${rubik80sFade.variable} bg-background`}
      >
        <Script
          id="theme-initialization"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitializationScript() }}
        />
        <ThemeProvider>
          <ClerkProvider>
            <CommandEnterSubmit />
            <div
              className="fixed top-5 right-5 z-20 inline-flex items-center gap-3"
              aria-label="Account and display settings"
            >
              <ThemeToggle />
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
            {children}
            <div
              className="fixed bottom-3 left-3 z-20 text-[0.625rem] font-medium uppercase tracking-[0.18em] text-foreground/45"
              aria-label={BUILD_VERSION_LABEL}
            >
              {BUILD_VERSION_LABEL}
            </div>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
