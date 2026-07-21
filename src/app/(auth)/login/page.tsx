import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { APP_NAME } from "@/config/env";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50/30 px-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-bold text-primary-600"
        >
          {APP_NAME}
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Auth forms ship in Milestone 1. This is the route shell.
        </p>
        <div className="mt-8 space-y-3">
          <div className="h-10 rounded-lg border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900" />
          <div className="h-10 rounded-lg border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900" />
          <Button className="w-full" disabled>
            Continue
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          No account?{" "}
          <Link href="/register" className="text-primary-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
