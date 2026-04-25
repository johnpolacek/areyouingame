import { HomeEntryActions } from "./home-entry-actions";

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
          className="flex w-full justify-center"
          aria-label="Daily game actions"
        >
          <HomeEntryActions />
        </div>
      </section>
    </main>
  );
}
