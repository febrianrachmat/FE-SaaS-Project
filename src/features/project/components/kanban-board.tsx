"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/shared/lib/utils";
import type { Task } from "../types";
import type { TaskPriority, TaskStatus } from "@/shared/types/domain";
import { projectApi } from "../api/project.api";
import { projectKeys, useTasks } from "../hooks/use-project";
import { KANBAN_COLUMNS, computePosition, type KanbanColumnId } from "../lib/kanban";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { LabelChips } from "./label-chips";
import { ListTodo } from "lucide-react";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  onSelectTask?: (taskId: string) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (taskId: string) => void;
  onRequestCreateTask?: () => void;
  filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    q?: string;
    assigneeId?: string;
    labelId?: string;
    cycleId?: string;
  };
};

function KanbanCard({
  task,
  onSelect,
  selected,
  onToggleSelect,
}: {
  task: Task;
  onSelect?: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { status: task.status } });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900",
        isDragging && "opacity-40",
        selected && "border-primary-400 ring-1 ring-primary-300",
      )}
    >
      <div className="mb-2 flex items-start gap-2">
        <input
          type="checkbox"
          className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-primary-600"
          checked={Boolean(selected)}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect?.();
          }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Select ${task.title}`}
        />
        <div
          className="min-w-0 flex-1 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          onClick={onSelect}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect?.();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Open task ${task.title}`}
        >
          <p className="text-sm font-medium text-slate-900 dark:text-zinc-50">
            {task.title}
          </p>
        </div>
      </div>
      <LabelChips labels={task.labels} className="mt-1.5" />
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>{task.priority}</span>
        <span>
          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            : "No due"}
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({
  id,
  label,
  tasks,
  onSelectTask,
  selectedIds,
  onToggleSelect,
}: {
  id: KanbanColumnId;
  label: string;
  tasks: Task[];
  onSelectTask?: (taskId: string) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (taskId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/80 dark:border-zinc-800 dark:bg-zinc-950/60",
        isOver && "ring-2 ring-primary-400/40",
      )}
      role="region"
      aria-label={`${label} column`}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {label}
        </h3>
        <span className="rounded-md bg-slate-200/80 px-1.5 text-[10px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
          {tasks.length}
        </span>
      </div>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-2 px-2 pb-3">
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onSelect={() => onSelectTask?.(task.id)}
              selected={selectedIds?.has(task.id)}
              onToggleSelect={() => onToggleSelect?.(task.id)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({
  workspaceSlug,
  projectSlug,
  onSelectTask,
  selectedIds,
  onToggleSelect,
  onRequestCreateTask,
  filters,
}: Props) {
  const queryClient = useQueryClient();
  const { data: tasks, isLoading } = useTasks(
    workspaceSlug,
    projectSlug,
    filters,
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const columns = useMemo(() => {
    const map = Object.fromEntries(
      KANBAN_COLUMNS.map((c) => [c.id, [] as Task[]]),
    ) as Record<KanbanColumnId, Task[]>;

    for (const task of tasks ?? []) {
      if (task.status === "CANCELED") continue;
      const key = task.status as KanbanColumnId;
      if (map[key]) map[key].push(task);
    }

    for (const col of KANBAN_COLUMNS) {
      map[col.id].sort((a, b) => a.position - b.position);
    }
    return map;
  }, [tasks]);

  const activeTask = tasks?.find((t) => t.id === activeId) ?? null;
  const tasksKey = projectKeys.tasks(
    workspaceSlug,
    projectSlug,
    JSON.stringify(filters ?? {}),
  );

  const moveMutation = useMutation({
    mutationFn: (payload: {
      taskId: string;
      status: TaskStatus;
      position: number;
    }) =>
      projectApi.moveTask(
        workspaceSlug,
        projectSlug,
        payload.taskId,
        { status: payload.status, position: payload.position },
      ),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: tasksKey });
      const previous = queryClient.getQueryData<Task[]>(tasksKey);
      queryClient.setQueryData<Task[]>(tasksKey, (old) =>
        (old ?? []).map((t) =>
          t.id === payload.taskId
            ? { ...t, status: payload.status, position: payload.position }
            : t,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(tasksKey, ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["projects", workspaceSlug, projectSlug, "tasks"],
      });
    },
  });

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !tasks) return;

    const taskId = String(active.id);
    const moving = tasks.find((t) => t.id === taskId);
    if (!moving) return;

    const overId = String(over.id);
    const overIsColumn = KANBAN_COLUMNS.some((c) => c.id === overId);
    const targetStatus = (
      overIsColumn
        ? overId
        : (tasks.find((t) => t.id === overId)?.status ?? moving.status)
    ) as TaskStatus;

    if (targetStatus === "CANCELED") return;

    const columnTasks = (tasks ?? [])
      .filter((t) => t.status === targetStatus && t.id !== taskId)
      .sort((a, b) => a.position - b.position);

    let insertIndex = columnTasks.length;
    if (!overIsColumn) {
      const idx = columnTasks.findIndex((t) => t.id === overId);
      if (idx >= 0) insertIndex = idx;
    }

    const before = columnTasks[insertIndex - 1]?.position ?? null;
    const after = columnTasks[insertIndex]?.position ?? null;
    const position = computePosition(before, after);

    if (moving.status === targetStatus && moving.position === position) {
      return;
    }

    moveMutation.mutate({ taskId, status: targetStatus, position });
  };

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((c) => (
          <Skeleton key={c.id} className="h-64 w-72 shrink-0 rounded-2xl" />
        ))}
      </div>
    );
  }

  const hasFilters = Boolean(
    filters?.q ||
      filters?.priority ||
      filters?.assigneeId ||
      filters?.labelId ||
      filters?.cycleId ||
      filters?.status,
  );
  const noTasks = (tasks?.length ?? 0) === 0;

  if (noTasks && !hasFilters) {
    return (
      <EmptyState
        icon={<ListTodo className="h-10 w-10" />}
        title="No tasks on this board"
        description="Add your first task to start moving work across columns."
        actionLabel="Create a task"
        onAction={() => onRequestCreateTask?.()}
      />
    );
  }

  if (noTasks && hasFilters) {
    return (
      <EmptyState
        title="No matching tasks"
        description="Try clearing filters or add a new task."
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            tasks={columns[col.id]}
            onSelectTask={onSelectTask}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="w-72 rounded-xl border border-primary-300 bg-white p-3 shadow-lg dark:border-primary-700 dark:bg-zinc-900">
            <p className="text-sm font-medium">{activeTask.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
