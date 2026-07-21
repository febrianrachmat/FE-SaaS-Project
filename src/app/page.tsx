import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/config/env";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-primary-50/40 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.12), transparent 40%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.1), transparent 35%)",
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-primary-600">
          {APP_NAME}
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-start px-6 pb-24 pt-20 md:pt-28">
        <p className="mb-4 text-sm font-medium tracking-wide text-primary-600 uppercase">
          Project management for modern teams
        </p>
        <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-zinc-50">
          {APP_NAME}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-zinc-400">
          {APP_TAGLINE}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register">
            <Button size="lg">Start free</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>

        <div className="mt-20 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-xl shadow-slate-200/50 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-none">
          <div className="flex h-10 items-center gap-2 border-b border-slate-200 px-4 dark:border-zinc-800">
            <span className="h-2.5 w-2.5 rounded-full bg-danger-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-success-500/80" />
            <span className="ml-3 text-xs text-slate-400">app.flowpilot.dev</span>
          </div>
          <div className="grid gap-4 p-6 md:grid-cols-3">
            {["Backlog", "In Progress", "Done"].map((col) => (
              <div key={col} className="space-y-3">
                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                  {col}
                </p>
                <div className="h-20 rounded-xl border border-slate-100 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950" />
                <div className="h-16 rounded-xl border border-slate-100 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
