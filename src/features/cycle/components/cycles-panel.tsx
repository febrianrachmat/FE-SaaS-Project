"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { ApiError } from "@/shared/types/api";
import { cn } from "@/shared/lib/utils";
import {
  useActivateCycle,
  useCompleteCycle,
  useCreateCycle,
  useCycles,
  useDeleteCycle,
  useUpdateCycle,
} from "../hooks/use-cycle";
import type { Cycle, CycleStatus } from "../types";

type Props = { workspaceSlug: string };

const STATUS_STYLES: Record<CycleStatus, string> = {
  PLANNED:
    "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
  ACTIVE:
    "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  COMPLETED:
    "bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDateInput(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function CyclesPanel({ workspaceSlug }: Props) {
  const { data: cycles = [], isLoading } = useCycles(workspaceSlug);
  const create = useCreateCycle(workspaceSlug);
  const update = useUpdateCycle(workspaceSlug);
  const activate = useActivateCycle(workspaceSlug);
  const complete = useCompleteCycle(workspaceSlug);
  const remove = useDeleteCycle(workspaceSlug);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  function beginEdit(cycle: Cycle) {
    setEditingId(cycle.id);
    setEditName(cycle.name);
    setEditDescription(cycle.description ?? "");
    setEditStartDate(toDateInput(cycle.startDate));
    setEditEndDate(toDateInput(cycle.endDate));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Cycles
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Plan sprints and timeboxes across projects in this workspace.
        </p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          create.mutate(
            {
              name: name.trim(),
              ...(description.trim()
                ? { description: description.trim() }
                : {}),
              ...(startDate ? { startDate } : {}),
              ...(endDate ? { endDate } : {}),
            },
            {
              onSuccess: () => {
                setName("");
                setDescription("");
                setStartDate("");
                setEndDate("");
              },
            },
          );
        }}
      >
        <div>
          <Label htmlFor="cycle-name">New cycle</Label>
          <Input
            id="cycle-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sprint 14"
            maxLength={100}
          />
        </div>
        <div>
          <Label htmlFor="cycle-description">Description</Label>
          <Input
            id="cycle-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional goals or focus"
            maxLength={2000}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="cycle-start">Start</Label>
            <Input
              id="cycle-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cycle-end">End</Label>
            <Input
              id="cycle-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        {create.error instanceof ApiError ? (
          <p className="text-sm text-danger-600">{create.error.message}</p>
        ) : null}
        <Button type="submit" disabled={create.isPending || !name.trim()}>
          {create.isPending ? "Creating…" : "Create cycle"}
        </Button>
      </form>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : cycles.length === 0 ? (
        <EmptyState
          title="No cycles yet"
          description="Create a cycle to group tasks into a timeboxed sprint."
        />
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {cycles.map((cycle) => (
            <li key={cycle.id} className="px-4 py-4">
              {editingId === cycle.id ? (
                <div className="space-y-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={100}
                  />
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    maxLength={2000}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                    />
                    <Input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                    />
                  </div>
                  {update.error instanceof ApiError ? (
                    <p className="text-sm text-danger-600">
                      {update.error.message}
                    </p>
                  ) : null}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={update.isPending || !editName.trim()}
                      onClick={() =>
                        update.mutate(
                          {
                            cycleId: cycle.id,
                            name: editName.trim(),
                            description: editDescription.trim() || null,
                            startDate: editStartDate || null,
                            endDate: editEndDate || null,
                          },
                          { onSuccess: () => setEditingId(null) },
                        )
                      }
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-zinc-50">
                        {cycle.name}
                      </p>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                          STATUS_STYLES[cycle.status],
                        )}
                      >
                        {cycle.status}
                      </span>
                    </div>
                    {cycle.description ? (
                      <p className="text-sm text-slate-500">
                        {cycle.description}
                      </p>
                    ) : null}
                    <p className="text-xs text-slate-400">
                      {formatDate(cycle.startDate)} →{" "}
                      {formatDate(cycle.endDate)}
                      {typeof cycle.taskCount === "number"
                        ? ` · ${cycle.taskCount} task${cycle.taskCount === 1 ? "" : "s"}`
                        : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cycle.status !== "ACTIVE" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={activate.isPending}
                        onClick={() => activate.mutate(cycle.id)}
                      >
                        Activate
                      </Button>
                    ) : null}
                    {cycle.status !== "COMPLETED" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={complete.isPending}
                        onClick={() => complete.mutate(cycle.id)}
                      >
                        Complete
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => beginEdit(cycle)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger-600"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete “${cycle.name}”? Tasks will be unlinked.`,
                          )
                        ) {
                          remove.mutate(cycle.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
