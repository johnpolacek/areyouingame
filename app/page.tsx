import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { getTodayGame } from "../lib/daily-game";

export default function Home() {
  const todayGame = getTodayGame();

  return (
    <main className="home">
      <section className="entry-panel" aria-labelledby="entry-title">
        <p className="kicker">Game {todayGame.id}</p>
        <h1 id="entry-title">Are You In?</h1>
        <p className="premise">
          Today&apos;s event begins at{" "}
          <time dateTime={todayGame.eventStartsAtIso}>
            {todayGame.eventStartsAtLabel}
          </time>
          . Private play runs until the daily recap goes public.
        </p>
        <div className="actions" aria-label="Daily game actions">
          <Link className="primary-action" href="/join">
            Join Today&apos;s Game
          </Link>
          <Show when="signed-out">
            <span className="auth-action">
              <SignInButton>Sign In</SignInButton>
            </span>
            <span className="auth-action">
              <SignUpButton>Create Account</SignUpButton>
            </span>
          </Show>
          <Show when="signed-in">
            <Link className="secondary-action" href="/game/today">
              Resume
            </Link>
          </Show>
        </div>
      </section>
    </main>
  );
}
