import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { getTodayGame } from "../../../lib/daily-game";

export default async function TodaysGamePage() {
  await auth.protect();

  const todayGame = getTodayGame();

  return (
    <main className="home">
      <section className="entry-panel entry-panel--compact">
        <p className="kicker">Game {todayGame.id}</p>
        <h1>Today&apos;s Game</h1>
        <p className="premise">
          Private chat opens after player creation. End-of-day results become a
          public recap.
        </p>
        <Link className="primary-action" href="/player/new">
          Create Today&apos;s Player
        </Link>
      </section>
    </main>
  );
}
