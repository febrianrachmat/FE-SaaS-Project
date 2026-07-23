"use client";

import { Trash2, Undo2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { ApiError } from "@/shared/types/api";
import { useWorkspaceCapabilities } from "@/features/workspace";
import {
  useRestoreProject,
  useRestoreTask,
  useTrash,
} from "../hooks/use-trash";

type Props = { workspaceSlug: string };

function formatWhen(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TrashPanel({ workspaceSlug }: Props) {
  const caps = useWorkspaceCapabilities(workspaceSlug);
  const { data, isLoading, isError, error } = useTrash(workspaceSlug);
  const restoreProject = useRestoreProject(workspaceSlug);
  const restoreTask = useRestoreTask(workspaceSlug);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-danger-600">
        {error instanceof ApiError ? error.message : "Failed to load trash"}
      </p>
    );
  }

  const projects = data?.projects ?? [];
  const tasks = data?.tasks ?? [];
  const empty = projects.length === 0 && tasks.length === 0;

  if (empty) {
    return (
      <EmptyState
        icon={<Trash2 className="size-8" />}
        title="Trash is empty"
        description="Deleted projects and tasks will appear here for restore."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Projects ({projects.length})
        </h2>
        {projects.length === 0 ? (
          <p className="text-sm text-slate-400">No deleted projects</p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-zinc-800 dark:border-zinc-800">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900 dark:text-zinc-50">
                    {p.icon ? `${p.icon} ` : null}
                    {p.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    /{p.slug} · deleted {formatWhen(p.deletedAt)}
                  </p>
                </div>
                {caps.canDeleteProject ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={restoreProject.isPending}
                    onClick={() => restoreProject.mutate(p.slug)}
                  >
                    <Undo2 className="mr-1.5 size-3.5" />
                    Restore
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {restoreProject.isError ? (
          <p className="text-sm text-danger-600">
            {restoreProject.error instanceof ApiError
              ? restoreProject.error.message
              : "Could not restore project"}
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Tasks ({tasks.length})
        </h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-400">No deleted tasks</p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-zinc-800 dark:border-zinc-800">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900 dark:text-zinc-50">
                    {t.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t.project.icon ? `${t.project.icon} ` : null}
                    {t.project.name}
                    {t.project.deleted ? " (project deleted)" : null}
                    {" · "}
                    deleted {formatWhen(t.deletedAt)}
                  </p>
                </div>
                {caps.canDeleteTask ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      restoreTask.isPending || t.project.deleted
                    }
                    title={
                      t.project.deleted
                        ? "Restore the project first"
                        : undefined
                    }
                    onClick={() =>
                      restoreTask.mutate({
                        projectSlug: t.project.slug,
                        taskId: t.id,
                      })
                    }
                  >
                    <Undo2 className="mr-1.5 size-3.5" />
                    Restore
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {restoreTask.isError ? (
          <p className="text-sm text-danger-600">
            {restoreTask.error instanceof ApiError
              ? restoreTask.error.message
              : "Could not restore task"}
          </p>
        ) : null}
      </section>
    </div>
  );
}
