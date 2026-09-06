import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Rethink_Sans, Rubik_80s_Fade, Stalinist_One } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AccountControls } from "./account-controls";
import { CommandEnterSubmit } from "./command-enter-submit";
import { ConvexClientProvider } from "./convex-client-provider";
import { isTheme, themeCookieKey } from "./theme";
import { SignupAccessProvider } from "./signup-access-provider";
import { ThemeProvider } from "./theme-provider";
import { isSignupEnabledForRequest } from "@/lib/signup-access";
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

const siteTitle = "Are You In?";
const siteDescription =
  "A daily persistent simulation of humanity's first contact with artificial superintelligence.";
const shareImage = {
  url: "/areyouin-screenshot.png",
  width: 2638,
  height: 1714,
  alt: siteTitle,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
  ),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [shareImage],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const storedTheme = cookieStore.get(themeCookieKey)?.value;
  const theme = isTheme(storedTheme) ? storedTheme : "dark";
  const signupEnabled = await isSignupEnabledForRequest();
  const content = (
    <ConvexClientProvider>
      <CommandEnterSubmit />
      <AccountControls />
      {children}
    </ConvexClientProvider>
  );

  return (
    <html
      className={theme}
      data-theme={theme}
      lang="en"
      suppressHydrationWarning
    >
      <body
        data-build-version={BUILD_VERSION_LABEL}
        className={`${rethinkSans.variable} ${stalinist.variable} ${rubik80sFade.variable} bg-background`}
      >
        <ThemeProvider>
          <SignupAccessProvider enabled={signupEnabled}>
            {signupEnabled ? (
              <ClerkProvider>{content}</ClerkProvider>
            ) : (
              content
            )}
            <div
              className="fixed bottom-3 left-3 z-20 text-[0.625rem] font-medium uppercase tracking-[0.18em] text-foreground/45"
              aria-label={BUILD_VERSION_LABEL}
            >
              {BUILD_VERSION_LABEL}
            </div>
          </SignupAccessProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
