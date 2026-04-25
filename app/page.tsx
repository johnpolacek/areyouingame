import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";
import { ArrowRightIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-16 sm:p-8">
      <section
        className="flex w-full max-w-4xl flex-col items-center gap-6 text-center"
        aria-labelledby="entry-title"
      >
        <h1
          id="entry-title"
          className="text-6xl leading-none font-semibold text-balance text-foreground sm:text-8xl"
        >
          Are You In?
        </h1>
        <div
          className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row"
          aria-label="Daily game actions"
        >
          <Link
            className={buttonVariants({
              className: "h-11 px-4 text-sm font-semibold sm:px-5",
            })}
            href="/join"
          >
            Join Today&apos;s Game
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
          <Show when="signed-out">
            <SignInButton>
              <Button
                className="h-11 px-4 text-sm font-semibold sm:px-5"
                variant="outline"
              >
                Sign In
              </Button>
            </SignInButton>
          </Show>
        </div>
      </section>
    </main>
  );
}
