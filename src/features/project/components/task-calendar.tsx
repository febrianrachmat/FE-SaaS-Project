"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { projectApi } from "../api/project.api";

type Props = {
  workspaceSlug: string;
};

export function TaskCalendar({ workspaceSlug }: Props) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const from = format(startOfWeek(startOfMonth(cursor)), "yyyy-MM-dd");
  const to = format(endOfWeek(endOfMonth(cursor)), "yyyy-MM-dd");

  const { data, isLoading } = useQuery({
    queryKey: ["calendar", workspaceSlug, from, to],
    queryFn: () => projectApi.calendar(workspaceSlug, from, to),
    enabled: !!workspaceSlug,
  });

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(cursor)),
      end: endOfWeek(endOfMonth(cursor)),
    });
  }, [cursor]);

  const byDay = useMemo(() => {
    const map = new Map<string, NonNullable<typeof data>>();
    for (const task of data ?? []) {
      if (!task.dueDate) continue;
      const key = format(new Date(task.dueDate), "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    }
    return map;
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          {format(cursor, "MMMM yyyy")}
        </h2>
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

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 dark:border-zinc-800 dark:bg-zinc-800">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="bg-slate-50 px-2 py-2 text-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:bg-zinc-950"
          >
            {d}
          </div>
        ))}

        {isLoading
          ? Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-none" />
            ))
          : days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const items = byDay.get(key) ?? [];
              const inMonth = isSameMonth(day, cursor);
              const today = isSameDay(day, new Date());

              return (
                <div
                  key={key}
                  className={cn(
                    "min-h-28 bg-white p-2 dark:bg-zinc-950",
                    !inMonth && "bg-slate-50/80 dark:bg-zinc-900/40",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                      today && "bg-primary-600 font-semibold text-white",
                      !today && inMonth && "text-slate-700 dark:text-zinc-200",
                      !inMonth && "text-slate-300",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <ul className="mt-1 space-y-1">
                    {items.slice(0, 3).map((task) => (
                      <li key={task.id}>
                        <Link
                          href={`/app/w/${workspaceSlug}/projects/${task.project.slug}`}
                          className="block truncate rounded-md bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-700 hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-300"
                          title={task.title}
                        >
                          {task.project.icon ?? "•"} {task.title}
                        </Link>
                      </li>
                    ))}
                    {items.length > 3 ? (
                      <li className="text-[10px] text-slate-400">
                        +{items.length - 3} more
                      </li>
                    ) : null}
                  </ul>
                </div>
              );
            })}
      </div>
    </div>
  );
}
