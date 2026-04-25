import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MessageCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTodayGame } from "../../../lib/daily-game";
import { getPlayerForUserGame } from "../../../lib/player-store";

export default async function TodaysGamePage() {
  const { userId } = await auth.protect();

  const todayGame = getTodayGame();
  const player = await getPlayerForUserGame(userId, todayGame.id);

  if (!player) {
    redirect("/player/new");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-20">
      <Card className="w-full max-w-2xl bg-card/80 shadow-2xl shadow-black/20 backdrop-blur">
        <CardHeader className="items-center text-center">
          <Badge variant="outline">Game {todayGame.id}</Badge>
          <CardTitle className="text-4xl font-semibold tracking-normal text-balance sm:text-5xl">
            Today&apos;s Game
          </CardTitle>
          <CardDescription className="max-w-lg text-base leading-7">
            {player.name} is checked in for the day.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <dl className="grid gap-3 rounded-lg border bg-background/40 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Location</dt>
              <dd className="font-medium">{player.location}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Occupation</dt>
              <dd className="font-medium">{player.occupation}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Age</dt>
              <dd className="font-medium">{player.age}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Timezone</dt>
              <dd className="font-medium">{player.timeZone}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Bio</dt>
              <dd className="font-medium">{player.bio}</dd>
            </div>
          </dl>
          <p className="mx-auto max-w-lg text-center text-base leading-7 text-muted-foreground">
            Your private chat opens next. End-of-day results become a public
            recap.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button className="h-9 px-3" disabled>
            Begin Private Chat
            <MessageCircleIcon data-icon="inline-end" />
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
