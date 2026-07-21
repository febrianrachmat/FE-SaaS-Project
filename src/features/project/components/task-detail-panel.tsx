"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { StatusBadge } from "./task-row";
import { useTask, useUpdateTask } from "../hooks/use-project";
import { projectApi } from "../api/project.api";
import { useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "../hooks/use-project";
import type { TaskPriority, TaskStatus } from "@/shared/types/domain";
import { X } from "lucide-react";
import { TaskAttachments, TaskComments } from "@/features/collab";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  taskId: string;
  onClose: () => void;
};

export function TaskDetailPanel({
  workspaceSlug,
  projectSlug,
  taskId,
  onClose,
}: Props) {
  const { data: task, isLoading } = useTask(workspaceSlug, projectSlug, taskId);
  const update = useUpdateTask(workspaceSlug, projectSlug);
  const queryClient = useQueryClient();
  const [checklistTitle, setChecklistTitle] = useState("");

  if (isLoading || !task) {
    return (
      <aside className="w-full max-w-md border-l border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-slate-400">Loading task…</p>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-zinc-800">
        <StatusBadge status={task.status} />
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <Input
          className="border-0 px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
          defaultValue={task.title}
          onBlur={(e) => {
            if (e.target.value !== task.title) {
              update.mutate({ taskId, title: e.target.value });
            }
          }}
        />

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-500">
            Status
            <select
              className="mt-1 flex h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={task.status}
              onChange={(e) =>
                update.mutate({
                  taskId,
                  status: e.target.value as TaskStatus,
                })
              }
            >
              {(
                [
                  "BACKLOG",
                  "TODO",
                  "IN_PROGRESS",
                  "REVIEW",
                  "TESTING",
                  "DONE",
                  "CANCELED",
                ] as TaskStatus[]
              ).map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-500">
            Priority
            <select
              className="mt-1 flex h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={task.priority}
              onChange={(e) =>
                update.mutate({
                  taskId,
                  priority: e.target.value as TaskPriority,
                })
              }
            >
              {(
                ["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"] as TaskPriority[]
              ).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">Description</p>
          <textarea
            className="min-h-24 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            defaultValue={task.description ?? ""}
            placeholder="Add a description…"
            onBlur={(e) => {
              const next = e.target.value || null;
              if (next !== (task.description ?? null)) {
                update.mutate({ taskId, description: next });
              }
            }}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-slate-500">Checklist</p>
          <ul className="space-y-2">
            {task.checklist?.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.isDone}
                  onChange={async () => {
                    await projectApi.updateChecklist(workspaceSlug, item.id, {
                      isDone: !item.isDone,
                    });
                    void queryClient.invalidateQueries({
                      queryKey: projectKeys.task(
                        workspaceSlug,
                        projectSlug,
                        taskId,
                      ),
                    });
                  }}
                />
                <span
                  className={
                    item.isDone ? "text-slate-400 line-through" : undefined
                  }
                >
                  {item.title}
                </span>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!checklistTitle.trim()) return;
              await projectApi.addChecklist(
                workspaceSlug,
                projectSlug,
                taskId,
                checklistTitle.trim(),
              );
              setChecklistTitle("");
              void queryClient.invalidateQueries({
                queryKey: projectKeys.task(workspaceSlug, projectSlug, taskId),
              });
            }}
          >
            <Input
              value={checklistTitle}
              onChange={(e) => setChecklistTitle(e.target.value)}
              placeholder="Add checklist item"
            />
            <Button type="submit" size="sm" variant="secondary">
              Add
            </Button>
          </form>
        </div>

        <TaskAttachments
          workspaceSlug={workspaceSlug}
          projectSlug={projectSlug}
          taskId={taskId}
        />

        <TaskComments
          workspaceSlug={workspaceSlug}
          projectSlug={projectSlug}
          taskId={taskId}
        />

        <p className="text-xs text-slate-400">
          Reporter: {task.reporter?.name ?? "—"} · Updated{" "}
          {new Date(task.updatedAt).toLocaleString()}
        </p>
      </div>
    </aside>
  );
}
