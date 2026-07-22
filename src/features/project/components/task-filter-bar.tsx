"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type { TaskPriority, TaskStatus } from "@/shared/types/domain";
import { useAuthStore } from "@/features/auth";
import { useWorkspaceMembers } from "@/features/workspace";

export type TaskFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  q?: string;
  assigneeId?: string;
};

type Props = {
  workspaceSlug: string;
  value: TaskFilters;
  onChange: (next: TaskFilters) => void;
  /** Hide status filter (e.g. on Kanban where columns already show status) */
  hideStatus?: boolean;
};

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

export function TaskFilterBar({
  workspaceSlug,
  value,
  onChange,
  hideStatus = false,
}: Props) {
  const me = useAuthStore((s) => s.user);
  const { data: members = [] } = useWorkspaceMembers(workspaceSlug);
  const hasFilters = Boolean(
    value.status || value.priority || value.q || value.assigneeId,
  );

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="relative min-w-[180px] flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          value={value.q ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              q: e.target.value || undefined,
            })
          }
          placeholder="Search tasks…"
          className="pl-9"
          aria-label="Search tasks"
        />
      </div>

      {!hideStatus ? (
        <label className="text-xs text-slate-500">
          Status
          <select
            className="mt-1 flex h-10 min-w-[140px] rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={value.status ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                status: (e.target.value || undefined) as TaskStatus | undefined,
              })
            }
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="text-xs text-slate-500">
        Priority
        <select
          className="mt-1 flex h-10 min-w-[130px] rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={value.priority ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              priority: (e.target.value || undefined) as
                | TaskPriority
                | undefined,
            })
          }
        >
          <option value="">All</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <label className="text-xs text-slate-500">
        Assignee
        <select
          className="mt-1 flex h-10 min-w-[160px] rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={value.assigneeId ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              assigneeId: e.target.value || undefined,
            })
          }
        >
          <option value="">Anyone</option>
          {me ? <option value={me.id}>Assigned to me</option> : null}
          {members
            .filter((m) => m.userId !== me?.id)
            .map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user.name}
              </option>
            ))}
        </select>
      </label>

      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-10"
          onClick={() => onChange({})}
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
