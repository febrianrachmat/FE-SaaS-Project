"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BrandLogo } from "@/shared/components/brand-logo";
import { Skeleton } from "@/shared/ui/skeleton";
import { ApiError } from "@/shared/types/api";
import { projectApi } from "@/features/project";

type Props = {
  params: Promise<{ token: string }>;
};

export default function SharedProjectPage({ params }: Props) {
  const { token } = use(params);
  const { data, isLoading, error } = useQuery({
    queryKey: ["share", token],
    queryFn: () => projectApi.resolveShareLink(token),
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/40 px-4 py-10 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo height={28} />
          <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 dark:bg-zinc-800">
            Read-only share
          </span>
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-2xl" />
        ) : error ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <h1 className="text-lg font-semibold">Link unavailable</h1>
            <p className="mt-2 text-sm text-slate-500">
              {error instanceof ApiError
                ? error.message
                : "This share link is invalid or has expired."}
            </p>
            <Link
              href="/"
              className="mt-6 inline-block text-sm text-primary-600 hover:underline"
            >
              Go to FlowPilot
            </Link>
          </div>
        ) : data ? (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div>
              <p className="text-xs text-slate-400">{data.project.workspaceName}</p>
              <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
                <span aria-hidden>{data.project.icon ?? "📁"}</span>{" "}
                {data.project.name}
              </h1>
              {data.project.description ? (
                <p className="mt-2 text-sm text-slate-500">
                  {data.project.description}
                </p>
              ) : null}
            </div>

            <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
              {data.tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <span className="font-medium text-slate-800 dark:text-zinc-100">
                    {task.title}
                  </span>
                  <span className="text-xs text-slate-400">
                    {task.status.replace("_", " ")} · {task.priority}
                    {task.assigneeName ? ` · ${task.assigneeName}` : ""}
                    {task.dueDate
                      ? ` · due ${new Date(task.dueDate).toLocaleDateString()}`
                      : ""}
                  </span>
                </li>
              ))}
              {data.tasks.length === 0 ? (
                <li className="py-8 text-center text-sm text-slate-400">
                  No tasks in this project.
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
