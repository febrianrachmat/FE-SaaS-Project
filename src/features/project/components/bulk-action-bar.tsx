"use client";

import { useWorkspaceMembers } from "@/features/workspace";
import type { TaskPriority, TaskStatus } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { useBulkTasks } from "../hooks/use-project";

const STATUSES: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "TESTING",
  "DONE",
  "CANCELED",
];

const PRIORITIES: TaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
  "CRITICAL",
];

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  selectedIds: string[];
  onClear: () => void;
};

export function BulkActionBar({
  workspaceSlug,
  projectSlug,
  selectedIds,
  onClear,
}: Props) {
  const bulk = useBulkTasks(workspaceSlug, projectSlug);
  const { data: members = [] } = useWorkspaceMembers(workspaceSlug);
  const count = selectedIds.length;

  if (count === 0) return null;

  function runUpdate(patch: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string | null;
  }) {
    bulk.mutate(
      { action: "update", taskIds: selectedIds, patch },
      { onSuccess: () => onClear() },
    );
  }

  return (
    <div
      className="sticky bottom-3 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/95"
      role="toolbar"
      aria-label="Bulk task actions"
    >
      <span className="text-sm font-medium text-slate-700 dark:text-zinc-200">
        {count} selected
      </span>

      <select
        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        defaultValue=""
        disabled={bulk.isPending}
        onChange={(e) => {
          const value = e.target.value as TaskStatus | "";
          if (!value) return;
          runUpdate({ status: value });
          e.target.value = "";
        }}
        aria-label="Set status"
      >
        <option value="" disabled>
          Status…
        </option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace("_", " ")}
          </option>
        ))}
      </select>

      <select
        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        defaultValue=""
        disabled={bulk.isPending}
        onChange={(e) => {
          const value = e.target.value as TaskPriority | "";
          if (!value) return;
          runUpdate({ priority: value });
          e.target.value = "";
        }}
        aria-label="Set priority"
      >
        <option value="" disabled>
          Priority…
        </option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <select
        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        defaultValue=""
        disabled={bulk.isPending}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) return;
          runUpdate({ assigneeId: value === "__unassign__" ? null : value });
          e.target.value = "";
        }}
        aria-label="Assign"
      >
        <option value="" disabled>
          Assign…
        </option>
        <option value="__unassign__">Unassigned</option>
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>
            {m.user.name}
          </option>
        ))}
      </select>

      <Button
        variant="outline"
        size="sm"
        disabled={bulk.isPending}
        onClick={() => {
          if (!window.confirm(`Delete ${count} task${count === 1 ? "" : "s"}?`)) {
            return;
          }
          bulk.mutate(
            { action: "delete", taskIds: selectedIds },
            { onSuccess: () => onClear() },
          );
        }}
      >
        Delete
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={bulk.isPending}
        onClick={onClear}
      >
        Clear
      </Button>
    </div>
  );
}
