"use client";

import { EmptyState } from "@/shared/ui/empty-state";
import { LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/features/auth";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
          Welcome{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          You&apos;re signed in. Workspace features arrive in Milestone 2.
        </p>
      </div>
      <EmptyState
        icon={<LayoutDashboard className="h-10 w-10" />}
        title="Dashboard ready"
        description={
          user?.emailVerifiedAt
            ? "Create a workspace next to start collaborating."
            : "Verify your email to unlock the full experience. Check your inbox for the link."
        }
      />
    </div>
  );
}
