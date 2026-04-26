type OpeningResponseSubmittedProps = {
  openingResponse: string;
};

export function OpeningResponseSubmitted({
  openingResponse,
}: OpeningResponseSubmittedProps) {
  return (
    <section
      aria-labelledby="opening-response-submitted-title"
      className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-7 text-center"
    >
      <div className="grid gap-4">
        <p className="text-[0.68rem] font-bold tracking-[0.22em] text-amber-400 uppercase">
          Response sent
        </p>
        <h1
          id="opening-response-submitted-title"
          className="text-2xl leading-9 font-semibold text-amber-200 text-balance sm:text-4xl sm:leading-12"
        >
          The game has your opening move.
        </h1>
        <p className="mx-auto max-w-xl text-base leading-7 font-medium text-amber-100/85 text-balance sm:text-lg sm:leading-8">
          Next, this answer becomes the setup for the first contact reveal.
        </p>
      </div>

      <blockquote className="w-full rounded-md border border-amber-300/30 bg-black/45 px-4 py-3 text-left text-base leading-7 font-medium text-amber-50 shadow-2xl shadow-black/35 backdrop-blur-md sm:text-lg">
        {openingResponse}
      </blockquote>
    </section>
  );
}
