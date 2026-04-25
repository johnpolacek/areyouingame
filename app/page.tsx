import { HeroBackgroundVideo } from "./hero-background-video";
import { HomeEntryActions } from "./home-entry-actions";

export default function Home() {
  return (
    <main className="relative isolate grid h-svh place-items-center overflow-hidden bg-black px-5 py-16 text-[#f7ead2] sm:p-8">
      <HeroBackgroundVideo />

      <section
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-7 self-center text-center sm:gap-8"
        aria-labelledby="entry-title"
      >
        <h1
          id="entry-title"
          className="hero-title text-[clamp(4.25rem,14vw,10rem)] leading-[0.82] font-black tracking-normal text-balance"
        >
          Are You In?
        </h1>
        <p className="hero-subtitle max-w-[22rem] text-[0.78rem] leading-7 font-medium tracking-[0.28em] text-balance text-[#e3b875] uppercase sm:max-w-none sm:text-xl sm:tracking-[0.55em]">
          A mysterious invitation awaits.
        </p>
        <div
          className="mt-4 flex w-full justify-center sm:mt-7"
          aria-label="Daily game actions"
        >
          <HomeEntryActions />
        </div>
      </section>
    </main>
  );
}
