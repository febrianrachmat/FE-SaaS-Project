"use client";

import Link from "next/link";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { LayoutDashboard, Plus } from "lucide-react";
import { useAuthStore } from "@/features/auth";
import { useWorkspaces } from "@/features/workspace";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: workspaces, isLoading } = useWorkspaces();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
            Welcome{user ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Choose a workspace or create a new one to get started.
          </p>
        </div>
        <Link href="/app/workspaces/new">
          <Button>
            <Plus className="h-4 w-4" />
            New workspace
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : workspaces && workspaces.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              href={`/app/w/${ws.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-primary-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-primary-700"
            >
              <p className="font-semibold text-slate-900 dark:text-zinc-50">
                {ws.name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                /{ws.slug} · {ws.memberCount ?? 0} members
              </p>
              <p className="mt-3 text-xs font-medium text-primary-600">
                {ws.role?.replace("_", " ")}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<LayoutDashboard className="h-10 w-10" />}
          title="Create your first workspace"
          description="Workspaces organize projects and teammates. You can create as many as you need."
          actionLabel="Create workspace"
          onAction={() => {
            window.location.href = "/app/workspaces/new";
          }}
        />
      )}
    </div>
  );
}
