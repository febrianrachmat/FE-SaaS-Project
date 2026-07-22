"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { StatusBadge } from "./task-row";
import { LABEL_COLORS } from "./label-chips";
import {
  useCreateLabel,
  useCreateTask,
  useDeleteLabel,
  useDeleteTask,
  useLabels,
  useSubtasks,
  useTask,
  useUpdateTask,
} from "../hooks/use-project";
import { projectApi } from "../api/project.api";
import { useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "../hooks/use-project";
import type { TaskPriority, TaskStatus } from "@/shared/types/domain";
import { Trash2, X } from "lucide-react";
import { TaskAttachments, TaskComments } from "@/features/collab";
import { useWorkspaceMembers } from "@/features/workspace";
import { useCycles } from "@/features/cycle";
import { cn } from "@/shared/lib/utils";
import { TaskDependencies } from "./task-dependencies";

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
  const createTask = useCreateTask(workspaceSlug, projectSlug);
  const deleteTask = useDeleteTask(workspaceSlug, projectSlug);
  const { data: members = [] } = useWorkspaceMembers(workspaceSlug);
  const { data: labels = [] } = useLabels(workspaceSlug);
  const { data: cycles = [] } = useCycles(workspaceSlug);
  const { data: subtasks = [] } = useSubtasks(workspaceSlug, projectSlug, taskId);
  const createLabel = useCreateLabel(workspaceSlug);
  const deleteLabel = useDeleteLabel(workspaceSlug);
  const queryClient = useQueryClient();
  const [checklistTitle, setChecklistTitle] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<string>(LABEL_COLORS[0]);

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

        <label className="block text-xs text-slate-500">
          Assignee
          <select
            className="mt-1 flex h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={task.assignee?.id ?? ""}
            onChange={(e) =>
              update.mutate({
                taskId,
                assigneeId: e.target.value || null,
              })
            }
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-500">
          Cycle
          <select
            className="mt-1 flex h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={task.cycle?.id ?? ""}
            onChange={(e) =>
              update.mutate({
                taskId,
                cycleId: e.target.value || null,
              })
            }
          >
            <option value="">No cycle</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.status === "ACTIVE" ? " (active)" : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-500">
            Due date
            <Input
              type="date"
              className="mt-1"
              defaultValue={
                task.dueDate
                  ? new Date(task.dueDate).toISOString().slice(0, 10)
                  : ""
              }
              onBlur={(e) => {
                const next = e.target.value || null;
                const current = task.dueDate
                  ? new Date(task.dueDate).toISOString().slice(0, 10)
                  : null;
                if (next !== current) {
                  update.mutate({ taskId, dueDate: next });
                }
              }}
            />
          </label>
          <label className="text-xs text-slate-500">
            Story points
            <Input
              type="number"
              min={0}
              max={100}
              className="mt-1"
              defaultValue={task.storyPoints ?? ""}
              onBlur={(e) => {
                const raw = e.target.value;
                const next = raw === "" ? null : Number(raw);
                if (next !== task.storyPoints) {
                  update.mutate({ taskId, storyPoints: next });
                }
              }}
            />
          </label>
          <label className="text-xs text-slate-500">
            Estimate (mins)
            <Input
              type="number"
              min={0}
              className="mt-1"
              defaultValue={task.estimatedMins ?? ""}
              onBlur={(e) => {
                const raw = e.target.value;
                const next = raw === "" ? null : Number(raw);
                if (next !== task.estimatedMins) {
                  update.mutate({ taskId, estimatedMins: next });
                }
              }}
            />
          </label>
          <label className="text-xs text-slate-500">
            Actual (mins)
            <Input
              type="number"
              min={0}
              className="mt-1"
              defaultValue={task.actualMins ?? ""}
              onBlur={(e) => {
                const raw = e.target.value;
                const next = raw === "" ? null : Number(raw);
                if (next !== task.actualMins) {
                  update.mutate({ taskId, actualMins: next });
                }
              }}
            />
          </label>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-slate-500">Labels</p>
          <div className="flex flex-wrap gap-1.5">
            {labels.map((label) => {
              const selected = task.labels?.some((l) => l.id === label.id);
              return (
                <button
                  key={label.id}
                  type="button"
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-white transition-opacity ${
                    selected ? "ring-2 ring-offset-1 ring-slate-400" : "opacity-55 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: label.color }}
                  onClick={() => {
                    const current = task.labels?.map((l) => l.id) ?? [];
                    const next = selected
                      ? current.filter((id) => id !== label.id)
                      : [...current, label.id];
                    update.mutate({ taskId, labelIds: next });
                  }}
                >
                  {label.name}
                  <span
                    role="button"
                    tabIndex={0}
                    className="ml-0.5 rounded px-0.5 text-[10px] opacity-80 hover:bg-black/20"
                    aria-label={`Delete label ${label.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete label "${label.name}"?`)) {
                        deleteLabel.mutate(label.id);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        e.preventDefault();
                        if (confirm(`Delete label "${label.name}"?`)) {
                          deleteLabel.mutate(label.id);
                        }
                      }
                    }}
                  >
                    ×
                  </span>
                </button>
              );
            })}
          </div>
          <form
            className="mt-3 flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newLabelName.trim()) return;
              createLabel.mutate(
                { name: newLabelName.trim(), color: newLabelColor },
                {
                  onSuccess: () => {
                    setNewLabelName("");
                  },
                },
              );
            }}
          >
            <Input
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="New label"
              className="h-8 max-w-[140px]"
            />
            <div className="flex gap-1">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-5 w-5 rounded-full ${
                    newLabelColor === color ? "ring-2 ring-offset-1 ring-slate-400" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                  onClick={() => setNewLabelColor(color)}
                />
              ))}
            </div>
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              disabled={createLabel.isPending || !newLabelName.trim()}
            >
              Add
            </Button>
          </form>
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

        {!task.parentId ? (
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">
              Subtasks
              {subtasks.length ? ` (${subtasks.length})` : ""}
            </p>
            <ul className="space-y-2">
              {subtasks.map((sub) => (
                <li
                  key={sub.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 px-2 py-1.5 dark:border-zinc-800"
                >
                  <input
                    type="checkbox"
                    checked={sub.status === "DONE"}
                    onChange={() =>
                      update.mutate({
                        taskId: sub.id,
                        status: sub.status === "DONE" ? "TODO" : "DONE",
                      })
                    }
                    aria-label={`Mark ${sub.title} done`}
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-sm",
                      sub.status === "DONE" && "text-slate-400 line-through",
                    )}
                  >
                    {sub.title}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-slate-400 hover:text-rose-600"
                    aria-label={`Delete subtask ${sub.title}`}
                    onClick={() => {
                      if (!confirm(`Delete subtask "${sub.title}"?`)) return;
                      deleteTask.mutate(sub.id, {
                        onSuccess: () => {
                          void queryClient.invalidateQueries({
                            queryKey: projectKeys.subtasks(
                              workspaceSlug,
                              projectSlug,
                              taskId,
                            ),
                          });
                          void queryClient.invalidateQueries({
                            queryKey: projectKeys.task(
                              workspaceSlug,
                              projectSlug,
                              taskId,
                            ),
                          });
                        },
                      });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!subtaskTitle.trim()) return;
                createTask.mutate(
                  {
                    title: subtaskTitle.trim(),
                    parentId: taskId,
                    status: "TODO",
                    priority: task.priority,
                  },
                  {
                    onSuccess: () => setSubtaskTitle(""),
                  },
                );
              }}
            >
              <Input
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                placeholder="Add subtask"
              />
              <Button
                type="submit"
                size="sm"
                variant="secondary"
                disabled={createTask.isPending || !subtaskTitle.trim()}
              >
                Add
              </Button>
            </form>
          </div>
        ) : null}

        <TaskDependencies
          workspaceSlug={workspaceSlug}
          projectSlug={projectSlug}
          taskId={taskId}
        />

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
                  className={cn(
                    "min-w-0 flex-1",
                    item.isDone && "text-slate-400 line-through",
                  )}
                >
                  {item.title}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-slate-400 hover:text-rose-600"
                  aria-label={`Delete checklist item ${item.title}`}
                  onClick={async () => {
                    await projectApi.deleteChecklist(workspaceSlug, item.id);
                    void queryClient.invalidateQueries({
                      queryKey: projectKeys.task(
                        workspaceSlug,
                        projectSlug,
                        taskId,
                      ),
                    });
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
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
