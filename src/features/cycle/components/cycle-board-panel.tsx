"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { ApiError } from "@/shared/types/api";
import { cn } from "@/shared/lib/utils";
import type { TaskStatus } from "@/shared/types/domain";
import {
  useActivateCycle,
  useAddCycleTask,
  useCompleteCycle,
  useCycleBoard,
  useCycleCandidates,
  useRemoveCycleTask,
} from "../hooks/use-cycle";
import { useWorkspaceCapabilities } from "@/features/workspace";

type Props = {
  workspaceSlug: string;
  cycleId: string;
};

const BOARD_COLUMNS: Array<{ id: TaskStatus; label: string }> = [
  { id: "BACKLOG", label: "Backlog" },
  { id: "TODO", label: "Todo" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "REVIEW", label: "Review" },
  { id: "TESTING", label: "Testing" },
  { id: "DONE", label: "Done" },
];

export function CycleBoardPanel({ workspaceSlug, cycleId }: Props) {
  const caps = useWorkspaceCapabilities(workspaceSlug);
  const canManageCycle = caps.canUpdateProject;
  const canEditTasks = caps.canUpdateTask;
  const { data: board, isLoading, isError } = useCycleBoard(
    workspaceSlug,
    cycleId,
  );
  const activate = useActivateCycle(workspaceSlug);
  const complete = useCompleteCycle(workspaceSlug);
  const addTask = useAddCycleTask(workspaceSlug, cycleId);
  const removeTask = useRemoveCycleTask(workspaceSlug, cycleId);
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const { data: candidates = [], isLoading: candidatesLoading } =
    useCycleCandidates(workspaceSlug, cycleId, q);

  const columns = useMemo(() => {
    const map = Object.fromEntries(
      BOARD_COLUMNS.map((c) => [c.id, [] as NonNullable<typeof board>["tasks"]]),
    ) as Record<TaskStatus, NonNullable<typeof board>["tasks"]>;
    for (const task of board?.tasks ?? []) {
      if (task.status === "CANCELED") continue;
      if (map[task.status]) map[task.status].push(task);
    }
    return map;
  }, [board?.tasks]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (isError || !board) {
    return (
      <EmptyState
        title="Cycle not found"
        description="It may have been deleted."
        actionLabel="Back to cycles"
        onAction={() => {
          window.location.href = `/app/w/${workspaceSlug}/cycles`;
        }}
      />
    );
  }

  const progress = board.progress ?? 0;
  const doneCount = board.doneCount ?? 0;
  const taskCount = board.taskCount ?? board.tasks.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/app/w/${workspaceSlug}/cycles`}
            className="mb-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary-600"
          >
            <ArrowLeft className="h-3 w-3" />
            Cycles
          </Link>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            {board.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {board.description || "Cycle board"} · {board.status.toLowerCase()}
            {board.startDate || board.endDate
              ? ` · ${board.startDate ? new Date(board.startDate).toLocaleDateString() : "—"} → ${board.endDate ? new Date(board.endDate).toLocaleDateString() : "—"}`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEditTasks ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowAdd((v) => !v)}
            >
              <Plus className="h-4 w-4" />
              Add task
            </Button>
          ) : null}
          {canManageCycle && board.status !== "ACTIVE" ? (
            <Button
              type="button"
              size="sm"
              disabled={activate.isPending}
              onClick={() => activate.mutate(cycleId)}
            >
              Activate
            </Button>
          ) : null}
          {canManageCycle && board.status !== "COMPLETED" ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={complete.isPending}
              onClick={() => complete.mutate(cycleId)}
            >
              Complete
            </Button>
          ) : null}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">
            Progress
          </p>
          <p className="text-xs text-slate-500">
            {doneCount}/{taskCount} done · {progress}%
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-primary-600 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {BOARD_COLUMNS.map((col) => {
            const count =
              board.tasksByStatus.find((s) => s.status === col.id)?.count ?? 0;
            return (
              <span
                key={col.id}
                className="rounded-md bg-slate-50 px-2 py-1 text-[11px] text-slate-600 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {col.label} {count}
              </span>
            );
          })}
        </div>
      </section>

      {showAdd && canEditTasks ? (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Add from workspace backlog</p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowAdd(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search open tasks…"
            aria-label="Search candidate tasks"
          />
          {addTask.error instanceof ApiError ? (
            <p className="text-sm text-danger-600">{addTask.error.message}</p>
          ) : null}
          {candidatesLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : candidates.length === 0 ? (
            <p className="text-sm text-slate-500">No matching open tasks.</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {candidates.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-zinc-800"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-slate-500">
                      {task.project.icon ?? "📁"} {task.project.name} ·{" "}
                      {task.status.replaceAll("_", " ")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={addTask.isPending}
                    onClick={() => addTask.mutate(task.id)}
                  >
                    Add
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {taskCount === 0 ? (
        <EmptyState
          title="No tasks in this cycle"
          description={
            canEditTasks
              ? "Add open tasks from your projects to start planning."
              : "No tasks have been added to this cycle yet."
          }
          actionLabel={canEditTasks ? "Add task" : undefined}
          onAction={canEditTasks ? () => setShowAdd(true) : undefined}
        />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {BOARD_COLUMNS.map((col) => (
            <div
              key={col.id}
              className="flex w-72 shrink-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/80 dark:border-zinc-800 dark:bg-zinc-950/60"
            >
              <div className="flex items-center justify-between px-3 py-3">
                <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  {col.label}
                </h3>
                <span className="rounded-md bg-slate-200/80 px-1.5 text-[10px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {columns[col.id].length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 px-2 pb-3">
                {columns[col.id].map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <Link
                      href={`/app/w/${workspaceSlug}/projects/${task.project.slug}?task=${task.id}`}
                      className="text-sm font-medium text-slate-900 hover:text-primary-700 dark:text-zinc-50 dark:hover:text-primary-300"
                    >
                      {task.title}
                    </Link>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {task.project.icon ?? "📁"} {task.project.name}
                      {task.assignee ? ` · ${task.assignee.name}` : ""}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {task.priority}
                      </span>
                      {canEditTasks ? (
                        <button
                          type="button"
                          className={cn(
                            "text-[11px] text-slate-400 hover:text-danger-600",
                            removeTask.isPending && "opacity-50",
                          )}
                          disabled={removeTask.isPending}
                          onClick={() => removeTask.mutate(task.id)}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
