"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMyWork } from "../hooks/use-dashboard";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { PaginationBar } from "@/shared/ui/pagination-bar";
import type { TaskStatus } from "@/shared/types/domain";
import { cn } from "@/shared/lib/utils";

type Props = { workspaceSlug: string };

const STATUSES: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "TESTING",
  "DONE",
  "CANCELED",
];

export function MyWorkPanel({ workspaceSlug }: Props) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [priority, setPriority] = useState("");
  const [includeDone, setIncludeDone] = useState(false);
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      ...(q.trim() ? { q: q.trim() } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(includeDone ? { includeDone: true } : {}),
      page,
      limit: 20,
    }),
    [q, status, priority, includeDone, page],
  );

  const { data, isLoading } = useMyWork(workspaceSlug, filters);
  const items = data?.data ?? [];
  const meta = data?.meta;

  function resetFilters() {
    setQ("");
    setStatus("");
    setPriority("");
    setIncludeDone(false);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          My Work
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Tasks assigned to you across this workspace.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1">
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search my tasks…"
            aria-label="Search my tasks"
          />
        </div>
        <label className="text-xs text-slate-500">
          Status
          <select
            className="mt-1 flex h-10 min-w-[140px] rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as TaskStatus | "");
              setPage(1);
            }}
          >
            <option value="">Open</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Priority
          <select
            className="mt-1 flex h-10 min-w-[130px] rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </label>
        <label className="flex h-10 items-center gap-2 text-sm text-slate-600 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={includeDone}
            onChange={(e) => {
              setIncludeDone(e.target.checked);
              setPage(1);
            }}
            className="rounded border-slate-300"
          />
          Include done
        </label>
        {q || status || priority || includeDone ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10"
            onClick={resetFilters}
          >
            Clear
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Nothing assigned"
          description="Tasks assigned to you will show up here. Open a project to create or claim work."
          actionLabel="Browse projects"
          onAction={() => {
            window.location.href = `/app/w/${workspaceSlug}/projects`;
          }}
        />
      ) : (
        <div className="space-y-3">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/app/w/${workspaceSlug}/projects/${item.project.slug}?task=${item.id}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-primary-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-primary-700"
                >
                  <span aria-hidden className="text-lg">
                    {item.project.icon ?? "📁"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-zinc-50">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.project.name}
                      {item.dueDate
                        ? ` · due ${new Date(item.dueDate).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-md px-2 py-1 text-[11px] font-medium",
                      "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
                    )}
                  >
                    {item.status.replaceAll("_", " ")}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {item.priority}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <PaginationBar
            page={meta?.page ?? page}
            totalPages={meta?.totalPages ?? 1}
            total={meta?.total}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
