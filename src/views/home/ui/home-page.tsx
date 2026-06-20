const foundations = ["Next.js", "Supabase", "TypeScript", "Tailwind CSS"];

export function HomePage() {
  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-6 py-20">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_top,rgb(79_70_229_/_0.2),transparent_65%)]"
      />

      <section className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.035] p-8 shadow-2xl shadow-black/30 backdrop-blur sm:p-12">
        <div className="mb-10 flex items-center gap-3 text-sm font-medium text-zinc-400">
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-500 font-semibold text-white">
            R
          </span>
          Relay
        </div>

        <p className="mb-3 text-sm font-medium tracking-wide text-indigo-300 uppercase">
          Foundation ready
        </p>
        <h1 className="max-w-xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          Work moves forward when the handoff is clear.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
          The production foundation is in place. Product workflows arrive in the
          next development stages.
        </p>

        <ul
          className="mt-10 flex flex-wrap gap-2"
          aria-label="Technology stack"
        >
          {foundations.map((foundation) => (
            <li
              key={foundation}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300"
            >
              {foundation}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
