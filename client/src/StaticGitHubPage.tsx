export default function StaticGitHubPage() {
  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12 sm:px-10">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Waides KI
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
            Autonomous AI trading, wallet intelligence, and platform operations.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            This static GitHub Pages build keeps the public landing page online while the full backend,
            database, authentication, and live trading services run on a server host.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://github.com/"
              className="rounded-md bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              View Project
            </a>
            <a
              href="#deployment"
              className="rounded-md border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200"
            >
              Deployment Notes
            </a>
          </div>
        </div>

        <section
          id="deployment"
          className="mt-14 grid gap-4 border-t border-slate-800 pt-8 text-sm text-slate-300 sm:grid-cols-3"
        >
          <div>
            <h2 className="font-semibold text-white">Static page</h2>
            <p className="mt-2">GitHub Pages serves this public build from dist/public.</p>
          </div>
          <div>
            <h2 className="font-semibold text-white">Backend needed</h2>
            <p className="mt-2">Login, dashboards, live APIs, and database features need the Express server.</p>
          </div>
          <div>
            <h2 className="font-semibold text-white">Build command</h2>
            <p className="mt-2 font-mono text-cyan-200">npm run build:pages</p>
          </div>
        </section>
      </main>
    </div>
  );
}
