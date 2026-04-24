import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { getTodayGame } from "../../../lib/daily-game";

export default async function NewPlayerPage() {
  await auth.protect();

  const todayGame = getTodayGame();

  return (
    <main className="home">
      <section className="entry-panel entry-panel--compact">
        <p className="kicker">Game {todayGame.id}</p>
        <h1>Create Your Player</h1>
        <p className="premise">
          This is the next unit: name, age, location, occupation, bio, and what
          you were doing at{" "}
          <time dateTime={todayGame.eventStartsAtIso}>
            {todayGame.eventStartsAtLabel}
          </time>
          .
        </p>
        <Link className="secondary-action" href="/">
          Back
        </Link>
      </section>
    </main>
  );
}
