"use client";

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  max as maxDate,
  min as minDate,
  startOfMonth,
  subMonths,
} from "date-fns";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { projectApi } from "@/features/project";
import { useRoadmap, roadmapKeys } from "../hooks/use-roadmap";
import type { RoadmapTask } from "@/features/project/types";

type Props = {
  workspaceSlug: string;
};

const STATUS_BAR: Record<string, string> = {
  BACKLOG: "bg-slate-400",
  TODO: "bg-sky-500",
  IN_PROGRESS: "bg-amber-500",
  REVIEW: "bg-violet-500",
  TESTING: "bg-indigo-500",
  DONE: "bg-emerald-500",
  CANCELED: "bg-slate-300",
};

const ROW_H = 34;

function barMetrics(
  task: RoadmapTask,
  rangeStart: Date,
  rangeEnd: Date,
  totalDays: number,
  provisionalDue?: string | null,
) {
  const rawStart = new Date(task.startDate);
  const rawEnd = new Date(provisionalDue ?? task.dueDate ?? task.startDate);
  const clampedStart = maxDate([minDate([rawStart, rawEnd]), rangeStart]);
  const clampedEnd = minDate([maxDate([rawStart, rawEnd]), rangeEnd]);
  const start = minDate([clampedStart, rangeEnd]);
  const end = maxDate([clampedEnd, rangeStart]);

  const offset = Math.max(0, differenceInCalendarDays(start, rangeStart));
  const span = Math.max(1, differenceInCalendarDays(end, start) + 1);
  const leftPct = (offset / totalDays) * 100;
  const widthPct = Math.min((span / totalDays) * 100, 100 - leftPct);

  return {
    leftPct,
    widthPct,
    left: `${leftPct}%`,
    width: `${widthPct}%`,
  };
}

export function RoadmapTimeline({ workspaceSlug }: Props) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [drag, setDrag] = useState<{
    taskId: string;
    projectSlug: string;
    originDue: string;
    dayDelta: number;
    trackWidth: number;
  } | null>(null);

  const rangeStart = startOfMonth(subMonths(cursor, 1));
  const rangeEnd = endOfMonth(addMonths(cursor, 1));
  const from = format(rangeStart, "yyyy-MM-dd");
  const to = format(rangeEnd, "yyyy-MM-dd");

  const queryClient = useQueryClient();
  const { data = [], isLoading } = useRoadmap(workspaceSlug, from, to);
  const updateDue = useMutation({
    mutationFn: (payload: {
      projectSlug: string;
      taskId: string;
      dueDate: string;
    }) =>
      projectApi.updateTask(workspaceSlug, payload.projectSlug, payload.taskId, {
        dueDate: payload.dueDate,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: roadmapKeys.list(workspaceSlug, from, to),
      });
    },
  });

  const days = useMemo(
    () => eachDayOfInterval({ start: rangeStart, end: rangeEnd }),
    [rangeStart, rangeEnd],
  );
  const totalDays = days.length;

  const byProject = useMemo(() => {
    const map = new Map<
      string,
      { project: RoadmapTask["project"]; tasks: RoadmapTask[] }
    >();
    for (const task of data) {
      if (projectFilter && task.project.id !== projectFilter) continue;
      const key = task.project.id;
      const entry = map.get(key) ?? { project: task.project, tasks: [] };
      entry.tasks.push(task);
      map.set(key, entry);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.project.name.localeCompare(b.project.name),
    );
  }, [data, projectFilter]);

  const projectOptions = useMemo(() => {
    const map = new Map<string, RoadmapTask["project"]>();
    for (const task of data) map.set(task.project.id, task.project);
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [data]);

  const monthTicks = useMemo(() => {
    const ticks: { label: string; left: string }[] = [];
    let d = startOfMonth(rangeStart);
    while (d <= rangeEnd) {
      const offset = differenceInCalendarDays(d, rangeStart);
      ticks.push({
        label: format(d, "MMM yyyy"),
        left: `${(offset / totalDays) * 100}%`,
      });
      d = addMonths(d, 1);
    }
    return ticks;
  }, [rangeStart, rangeEnd, totalDays]);

  function provisionalDueFor(task: RoadmapTask): string | null | undefined {
    if (!drag || drag.taskId !== task.id || !task.dueDate) return undefined;
    return format(addDays(new Date(drag.originDue), drag.dayDelta), "yyyy-MM-dd");
  }

  function onBarPointerDown(
    e: ReactPointerEvent<HTMLButtonElement>,
    task: RoadmapTask,
    trackEl: HTMLDivElement | null,
  ) {
    if (!task.dueDate || !trackEl) return;
    e.preventDefault();
    e.stopPropagation();
    const trackWidth = trackEl.getBoundingClientRect().width;
    const pointerId = e.pointerId;
    e.currentTarget.setPointerCapture(pointerId);

    const originX = e.clientX;
    setDrag({
      taskId: task.id,
      projectSlug: task.project.slug,
      originDue: task.dueDate.slice(0, 10),
      dayDelta: 0,
      trackWidth,
    });

    const onMove = (ev: PointerEvent) => {
      const dayDelta = Math.round(
        ((ev.clientX - originX) / trackWidth) * totalDays,
      );
      setDrag((prev) =>
        prev && prev.taskId === task.id ? { ...prev, dayDelta } : prev,
      );
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const dayDelta = Math.round(
        ((ev.clientX - originX) / trackWidth) * totalDays,
      );
      const nextDue = format(
        addDays(new Date(task.dueDate!.slice(0, 10)), dayDelta),
        "yyyy-MM-dd",
      );
      setDrag(null);
      if (dayDelta !== 0) {
        updateDue.mutate({
          projectSlug: task.project.slug,
          taskId: task.id,
          dueDate: nextDue,
        });
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {format(cursor, "MMMM yyyy")}
          </h2>
          <p className="text-xs text-slate-500">
            Showing {format(rangeStart, "MMM d")} –{" "}
            {format(rangeEnd, "MMM d, yyyy")} · drag bars to move due dates
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            aria-label="Filter by project"
          >
            <option value="">All projects</option>
            {projectOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor((d) => subMonths(d, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(startOfMonth(new Date()))}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor((d) => addMonths(d, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : !byProject.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center text-sm text-slate-500 dark:border-zinc-800">
          No tasks with due dates in this range.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
          <div className="min-w-[720px]">
            <div className="relative h-8 border-b border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950">
              {monthTicks.map((tick) => (
                <span
                  key={tick.label}
                  className="absolute top-2 text-[11px] font-medium text-slate-500"
                  style={{ left: tick.left }}
                >
                  {tick.label}
                </span>
              ))}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {byProject.map(({ project, tasks }) => (
                <ProjectRoadmapGroup
                  key={project.id}
                  workspaceSlug={workspaceSlug}
                  project={project}
                  tasks={tasks}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  totalDays={totalDays}
                  provisionalDueFor={provisionalDueFor}
                  onBarPointerDown={onBarPointerDown}
                  draggingTaskId={drag?.taskId ?? null}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectRoadmapGroup({
  workspaceSlug,
  project,
  tasks,
  rangeStart,
  rangeEnd,
  totalDays,
  provisionalDueFor,
  onBarPointerDown,
  draggingTaskId,
}: {
  workspaceSlug: string;
  project: RoadmapTask["project"];
  tasks: RoadmapTask[];
  rangeStart: Date;
  rangeEnd: Date;
  totalDays: number;
  provisionalDueFor: (task: RoadmapTask) => string | null | undefined;
  onBarPointerDown: (
    e: ReactPointerEvent<HTMLButtonElement>,
    task: RoadmapTask,
    trackEl: HTMLDivElement | null,
  ) => void;
  draggingTaskId: string | null;
}) {
  const trackRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const taskIds = new Set(tasks.map((t) => t.id));
  const metrics = tasks.map((task) =>
    barMetrics(task, rangeStart, rangeEnd, totalDays, provisionalDueFor(task)),
  );

  const edges = tasks.flatMap((task, fromIdx) =>
    (task.blocksTaskIds ?? [])
      .map((toId) => {
        const toIdx = tasks.findIndex((t) => t.id === toId);
        if (toIdx < 0 || !taskIds.has(toId)) return null;
        return { fromIdx, toIdx };
      })
      .filter((e): e is { fromIdx: number; toIdx: number } => e !== null),
  );

  return (
    <div className="bg-white dark:bg-zinc-950">
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 dark:border-zinc-900">
        <span className="text-sm">{project.icon ?? "📁"}</span>
        <Link
          href={`/app/w/${workspaceSlug}/projects/${project.slug}`}
          className="text-sm font-medium hover:underline"
        >
          {project.name}
        </Link>
        <span className="text-xs text-slate-400">
          {tasks.length} task{tasks.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="relative px-3 py-3">
        {edges.length > 0 ? (
          <svg
            className="pointer-events-none absolute top-3 right-3 bottom-3 left-[calc(160px+0.75rem+0.75rem)] text-slate-400"
            viewBox={`0 0 1000 ${tasks.length * ROW_H}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <marker
                id={`arrow-${project.id}`}
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
              </marker>
            </defs>
            {edges.map(({ fromIdx, toIdx }) => {
              const from = metrics[fromIdx];
              const to = metrics[toIdx];
              if (!from || !to) return null;
              const x1 = ((from.leftPct + from.widthPct) / 100) * 1000;
              const y1 = fromIdx * ROW_H + ROW_H / 2;
              const x2 = (to.leftPct / 100) * 1000;
              const y2 = toIdx * ROW_H + ROW_H / 2;
              const midX = (x1 + x2) / 2;
              return (
                <path
                  key={`${fromIdx}-${toIdx}`}
                  d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeOpacity="0.55"
                  vectorEffect="non-scaling-stroke"
                  markerEnd={`url(#arrow-${project.id})`}
                />
              );
            })}
          </svg>
        ) : null}

        <div className="space-y-1.5">
          {tasks.map((task, idx) => {
            const style = metrics[idx]!;
            const provisional = provisionalDueFor(task);
            return (
              <div
                key={task.id}
                className="grid grid-cols-[160px_1fr] items-center gap-3"
                style={{ height: ROW_H - 6 }}
              >
                <Link
                  href={`/app/w/${workspaceSlug}/projects/${project.slug}?task=${task.id}`}
                  className="truncate text-xs text-slate-600 hover:text-slate-900 hover:underline dark:text-slate-300 dark:hover:text-white"
                  title={task.title}
                >
                  {task.title}
                </Link>
                <div
                  ref={(el) => {
                    if (el) trackRefs.current.set(task.id, el);
                    else trackRefs.current.delete(task.id);
                  }}
                  className="relative h-7 overflow-hidden rounded-md bg-slate-100 dark:bg-zinc-900"
                >
                  <button
                    type="button"
                    className={cn(
                      "absolute top-0.5 bottom-0.5 flex cursor-grab items-center overflow-hidden rounded px-2 text-[10px] font-medium text-white active:cursor-grabbing",
                      STATUS_BAR[task.status] ?? "bg-slate-500",
                      draggingTaskId === task.id && "ring-2 ring-white/70",
                    )}
                    style={{ left: style.left, width: style.width }}
                    title={`${task.title} · due ${
                      provisional || task.dueDate
                        ? format(
                            new Date(provisional ?? task.dueDate!),
                            "MMM d",
                          )
                        : "—"
                    } · drag to move due date`}
                    onPointerDown={(e) =>
                      onBarPointerDown(
                        e,
                        task,
                        trackRefs.current.get(task.id) ?? null,
                      )
                    }
                    onDoubleClick={() => {
                      window.location.href = `/app/w/${workspaceSlug}/projects/${project.slug}?task=${task.id}`;
                    }}
                  >
                    <span className="truncate">{task.title}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
