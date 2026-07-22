"use client";

import { cn } from "@/shared/lib/utils";
import type { Task } from "../types";
import type { TaskPriority, TaskStatus } from "@/shared/types/domain";
import { LabelChips } from "./label-chips";

const STATUS_STYLE: Record<TaskStatus, string> = {
  BACKLOG: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
  TODO: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  REVIEW: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  TESTING: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  CANCELED: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

const PRIORITY_DOT: Record<TaskPriority, string> = {
  LOW: "bg-slate-400",
  MEDIUM: "bg-sky-500",
  HIGH: "bg-amber-500",
  URGENT: "bg-orange-500",
  CRITICAL: "bg-red-500",
};

type Props = {
  task: Task;
  onClick?: () => void;
  onStatusChange?: (status: TaskStatus) => void;
};

export function TaskRow({ task, onClick, onStatusChange }: Props) {
  return (
    <div
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-primary-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-primary-700"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      role="button"
      tabIndex={0}
    >
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", PRIORITY_DOT[task.priority])}
        title={task.priority}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-zinc-50">
          {task.title}
        </p>
        <LabelChips labels={task.labels} className="mt-1" />
        <p className="mt-0.5 text-xs text-slate-400">
          {task.assignee?.name ?? "Unassigned"}
          {task.dueDate
            ? ` · due ${new Date(task.dueDate).toLocaleDateString()}`
            : ""}
          {task.subtaskCount ? ` · ${task.subtaskCount} subtasks` : ""}
        </p>
      </div>
      <select
        className={cn(
          "rounded-md px-2 py-1 text-xs font-medium",
          STATUS_STYLE[task.status],
        )}
        value={task.status}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onStatusChange?.(e.target.value as TaskStatus)}
        aria-label="Task status"
      >
        {(Object.keys(STATUS_STYLE) as TaskStatus[]).map((s) => (
          <option key={s} value={s}>
            {s.replace("_", " ")}
          </option>
        ))}
      </select>
    </div>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-xs font-medium",
        STATUS_STYLE[status],
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
