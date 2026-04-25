import { HeroBackgroundVideo } from "./hero-background-video";
import { AnimatedHomeHero } from "./animated-home-hero";

export default function Home() {
  return (
    <main className="relative isolate grid h-svh place-items-center overflow-hidden bg-black px-5 py-16 text-amber-50 sm:p-8">
      <HeroBackgroundVideo />

      <AnimatedHomeHero />
    </main>
  );
}
