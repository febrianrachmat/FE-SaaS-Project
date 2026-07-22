"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  useAddDependency,
  useRemoveDependency,
  useTaskDependencies,
  useTasks,
} from "../hooks/use-project";
import type { TaskDependency, TaskDependencyType } from "../types";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  taskId: string;
};

function DependencyList({
  title,
  items,
  onRemove,
  removing,
}: {
  title: string;
  items: TaskDependency[];
  onRemove: (id: string) => void;
  removing: boolean;
}) {
  if (!items.length) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
        {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((dep) => (
          <li
            key={dep.id}
            className="flex items-center gap-2 rounded-lg border border-slate-100 px-2 py-1.5 dark:border-zinc-800"
          >
            <span className="min-w-0 flex-1 truncate text-sm">
              {dep.relatedTask.title}
            </span>
            <span className="shrink-0 text-[10px] text-slate-400">
              {dep.relatedTask.status.replaceAll("_", " ")}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-slate-400 hover:text-rose-600"
              aria-label={`Remove dependency ${dep.relatedTask.title}`}
              disabled={removing}
              onClick={() => onRemove(dep.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TaskDependencies({
  workspaceSlug,
  projectSlug,
  taskId,
}: Props) {
  const { data } = useTaskDependencies(workspaceSlug, projectSlug, taskId);
  const add = useAddDependency(workspaceSlug, projectSlug, taskId);
  const remove = useRemoveDependency(workspaceSlug, projectSlug, taskId);
  const { data: tasks = [] } = useTasks(workspaceSlug, projectSlug);

  const [query, setQuery] = useState("");
  const [type, setType] = useState<TaskDependencyType>("BLOCKS");
  const [selectedId, setSelectedId] = useState("");

  const linkedIds = useMemo(() => {
    const ids = new Set<string>([taskId]);
    for (const list of [
      data?.blocking ?? [],
      data?.blockedBy ?? [],
      data?.relatesTo ?? [],
    ]) {
      for (const dep of list) ids.add(dep.relatedTask.id);
    }
    return ids;
  }, [data, taskId]);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((t) => !linkedIds.has(t.id))
      .filter((t) => !q || t.title.toLowerCase().includes(q))
      .slice(0, 8);
  }, [tasks, linkedIds, query]);

  const blocking = data?.blocking ?? [];
  const blockedBy = data?.blockedBy ?? [];
  const relatesTo = data?.relatesTo ?? [];
  const total = blocking.length + blockedBy.length + relatesTo.length;

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-500">
        Dependencies{total ? ` (${total})` : ""}
      </p>

      <div className="space-y-3">
        <DependencyList
          title="Blocks"
          items={blocking}
          removing={remove.isPending}
          onRemove={(id) => remove.mutate(id)}
        />
        <DependencyList
          title="Blocked by"
          items={blockedBy}
          removing={remove.isPending}
          onRemove={(id) => remove.mutate(id)}
        />
        <DependencyList
          title="Relates to"
          items={relatesTo}
          removing={remove.isPending}
          onRemove={(id) => remove.mutate(id)}
        />

        {!total ? (
          <p className="text-xs text-slate-400">No dependencies yet.</p>
        ) : null}

        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedId) return;
            add.mutate(
              { toTaskId: selectedId, type },
              {
                onSuccess: () => {
                  setSelectedId("");
                  setQuery("");
                },
              },
            );
          }}
        >
          <div className="flex gap-2">
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              value={type}
              onChange={(e) =>
                setType(e.target.value as TaskDependencyType)
              }
              aria-label="Dependency type"
            >
              <option value="BLOCKS">Blocks</option>
              <option value="IS_BLOCKED_BY">Blocked by</option>
              <option value="RELATES_TO">Relates to</option>
            </select>
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedId("");
              }}
              placeholder="Search tasks…"
              className="text-sm"
            />
          </div>

          {query.trim() && candidates.length > 0 ? (
            <ul className="max-h-36 overflow-auto rounded-lg border border-slate-200 dark:border-zinc-700">
              {candidates.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-zinc-900 ${
                      selectedId === t.id
                        ? "bg-slate-100 dark:bg-zinc-800"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedId(t.id);
                      setQuery(t.title);
                    }}
                  >
                    <span className="truncate">{t.title}</span>
                    <span className="ml-2 shrink-0 text-[10px] text-slate-400">
                      {t.status.replaceAll("_", " ")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <Button
            type="submit"
            size="sm"
            variant="secondary"
            disabled={add.isPending || !selectedId}
          >
            Add dependency
          </Button>
        </form>
      </div>
    </div>
  );
}
