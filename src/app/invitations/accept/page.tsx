import Link from "next/link";
import { Suspense } from "react";
import { AcceptInvitationPanel } from "@/features/workspace";
import { AuthBootstrap } from "@/features/auth";
import { APP_NAME } from "@/config/env";
import { Skeleton } from "@/shared/ui/skeleton";

export const metadata = { title: "Accept invitation" };

export default function AcceptInvitationPage() {
  return (
    <AuthBootstrap>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50/30 px-4 dark:from-zinc-950 dark:to-zinc-900">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-lg font-bold text-primary-600"
          >
            {APP_NAME}
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Join workspace
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review your invite and join the team.
          </p>
          <Suspense fallback={<Skeleton className="mt-8 h-24 w-full" />}>
            <AcceptInvitationPanel />
          </Suspense>
        </div>
      </div>
    </AuthBootstrap>
  );
}
