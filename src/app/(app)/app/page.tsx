"use client";

import Link from "next/link";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { LayoutDashboard, Plus } from "lucide-react";
import { useAuthStore } from "@/features/auth";
import { useWorkspaces, useWorkspaceStore } from "@/features/workspace";
import { WorkspaceDashboard } from "@/features/dashboard";
import { useEffect } from "react";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: workspaces, isLoading } = useWorkspaces();
  const { activeSlug, setActiveWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (!workspaces?.length) return;
    if (activeSlug && workspaces.some((w) => w.slug === activeSlug)) return;
    setActiveWorkspace(workspaces[0]);
  }, [workspaces, activeSlug, setActiveWorkspace]);

  const active = workspaces?.find((w) => w.slug === activeSlug) ?? workspaces?.[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
            Welcome{user ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {active
              ? `Analytics for ${active.name}`
              : "Choose a workspace or create a new one to get started."}
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
      ) : workspaces && workspaces.length > 0 && active ? (
        <>
          <div className="flex flex-wrap gap-2">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => setActiveWorkspace(ws)}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  ws.slug === active.slug
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {ws.name}
              </button>
            ))}
            <Link
              href={`/app/w/${active.slug}`}
              className="rounded-lg px-3 py-1.5 text-sm text-primary-600 hover:underline"
            >
              Open workspace →
            </Link>
          </div>
          <WorkspaceDashboard workspaceSlug={active.slug} />
        </>
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
