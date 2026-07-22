"use client";

import { useMemo, useState } from "react";
import {
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { useRoadmap } from "../hooks/use-roadmap";
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

function barStyle(
  task: RoadmapTask,
  rangeStart: Date,
  rangeEnd: Date,
  totalDays: number,
) {
  const rawStart = new Date(task.startDate);
  const rawEnd = new Date(task.dueDate ?? task.startDate);
  const clampedStart = maxDate([minDate([rawStart, rawEnd]), rangeStart]);
  const clampedEnd = minDate([
    maxDate([rawStart, rawEnd]),
    rangeEnd,
  ]);
  const start = minDate([clampedStart, rangeEnd]);
  const end = maxDate([clampedEnd, rangeStart]);

  const offset = Math.max(0, differenceInCalendarDays(start, rangeStart));
  const span = Math.max(1, differenceInCalendarDays(end, start) + 1);
  const left = (offset / totalDays) * 100;
  const width = (span / totalDays) * 100;

  return {
    left: `${left}%`,
    width: `${Math.min(width, 100 - left)}%`,
  };
}

export function RoadmapTimeline({ workspaceSlug }: Props) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const rangeStart = startOfMonth(subMonths(cursor, 1));
  const rangeEnd = endOfMonth(addMonths(cursor, 1));
  const from = format(rangeStart, "yyyy-MM-dd");
  const to = format(rangeEnd, "yyyy-MM-dd");

  const { data = [], isLoading } = useRoadmap(workspaceSlug, from, to);

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
      const key = task.project.id;
      const entry = map.get(key) ?? { project: task.project, tasks: [] };
      entry.tasks.push(task);
      map.set(key, entry);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.project.name.localeCompare(b.project.name),
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {format(cursor, "MMMM yyyy")}
          </h2>
          <p className="text-xs text-slate-500">
            Showing {format(rangeStart, "MMM d")} –{" "}
            {format(rangeEnd, "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
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
                <div key={project.id} className="bg-white dark:bg-zinc-950">
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

                  <div className="space-y-1.5 px-3 py-3">
                    {tasks.map((task) => {
                      const style = barStyle(
                        task,
                        rangeStart,
                        rangeEnd,
                        totalDays,
                      );
                      return (
                        <div
                          key={task.id}
                          className="grid grid-cols-[160px_1fr] items-center gap-3"
                        >
                          <Link
                            href={`/app/w/${workspaceSlug}/projects/${project.slug}?task=${task.id}`}
                            className="truncate text-xs text-slate-600 hover:text-slate-900 hover:underline dark:text-slate-300 dark:hover:text-white"
                            title={task.title}
                          >
                            {task.title}
                          </Link>
                          <div className="relative h-7 overflow-hidden rounded-md bg-slate-100 dark:bg-zinc-900">
                            <Link
                              href={`/app/w/${workspaceSlug}/projects/${project.slug}?task=${task.id}`}
                              className={cn(
                                "absolute top-0.5 bottom-0.5 flex items-center overflow-hidden rounded px-2 text-[10px] font-medium text-white",
                                STATUS_BAR[task.status] ?? "bg-slate-500",
                              )}
                              style={style}
                              title={`${task.title} · due ${task.dueDate ? format(new Date(task.dueDate), "MMM d") : "—"}`}
                            >
                              <span className="truncate">{task.title}</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
