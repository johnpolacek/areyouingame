import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
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

export default async function NewPlayerPage() {
  await auth.protect();

  const todayGame = getTodayGame();

  return (
    <main className="grid min-h-screen place-items-center px-4 py-20">
      <Card className="w-full max-w-xl bg-card/80 shadow-2xl shadow-black/20 backdrop-blur">
        <CardHeader className="items-center text-center">
          <Badge variant="outline">Game {todayGame.id}</Badge>
          <CardTitle className="text-4xl font-semibold tracking-normal text-balance sm:text-5xl">
            Create Your Player
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mx-auto max-w-lg text-center text-base leading-7 text-muted-foreground">
            This is the next unit: name, age, location, occupation, bio, and
            what you were doing at{" "}
            <time dateTime={todayGame.eventStartsAtIso}>
              {todayGame.eventStartsAtLabel}
            </time>
            .
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link className={buttonVariants({ variant: "outline" })} href="/">
            Back
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
