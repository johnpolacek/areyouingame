import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTodayGame } from "../../../lib/daily-game";

export default async function TodaysGamePage() {
  await auth.protect();

  const todayGame = getTodayGame();

  return (
    <main className="grid min-h-screen place-items-center px-4 py-20">
      <Card className="w-full max-w-xl bg-card/80 shadow-2xl shadow-black/20 backdrop-blur">
        <CardHeader className="items-center text-center">
          <Badge variant="outline">Game {todayGame.id}</Badge>
          <CardTitle className="text-4xl font-semibold tracking-normal text-balance sm:text-5xl">
            Today&apos;s Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mx-auto max-w-lg text-center text-base leading-7 text-muted-foreground">
            Private chat opens after player creation. End-of-day results become
            a public recap.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            className={buttonVariants({ className: "h-9 px-3" })}
            href="/player/new"
          >
            Create Today&apos;s Player
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
