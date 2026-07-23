"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Activity } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { cn } from "@/shared/lib/utils";
import { useActivityFeed } from "../hooks/use-dashboard";
import {
  activitySubject,
  formatActivityAction,
} from "../lib/activity-format";

const ACTION_FILTERS = [
  { value: "", label: "All" },
  { value: "TASK_CREATED", label: "Tasks" },
  { value: "COMMENT_ADDED", label: "Comments" },
  { value: "PROJECT_CREATED", label: "Projects" },
  { value: "INVITATION_SENT", label: "Invites" },
  { value: "FILE_UPLOADED", label: "Files" },
] as const;

type Props = {
  workspaceSlug: string;
};

export function ActivityFeed({ workspaceSlug }: Props) {
  const router = useRouter();
  const [action, setAction] = useState("");
  const filters = useMemo(
    () => (action ? { action } : undefined),
    [action],
  );
  const feed = useActivityFeed(workspaceSlug, filters);

  const items = feed.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ACTION_FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            type="button"
            onClick={() => setAction(f.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              action === f.value
                ? "bg-primary-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {feed.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : null}

      {feed.isError ? (
        <p className="text-sm text-danger-600">Unable to load activity.</p>
      ) : null}

      {!feed.isLoading && !feed.isError && items.length === 0 ? (
        <EmptyState
          icon={<Activity className="h-8 w-8" />}
          title="No activity yet"
          description="Task updates, comments, invites, and project changes will show up here."
          actionLabel="Go to projects"
          onAction={() => router.push(`/app/w/${workspaceSlug}/projects`)}
        />
      ) : null}

      {items.length > 0 ? (
        <ol className="relative space-y-0 border-l border-slate-200 pl-6 dark:border-zinc-800">
          {items.map((item) => {
            const subject = activitySubject(item);
            const href =
              item.project?.slug && item.task?.id
                ? `/app/w/${workspaceSlug}/projects/${item.project.slug}?task=${item.task.id}`
                : item.project?.slug
                  ? `/app/w/${workspaceSlug}/projects/${item.project.slug}`
                  : null;
            const initials = item.actor.name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <li key={item.id} className="relative pb-6 last:pb-0">
                <span className="absolute -left-[31px] top-1 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-semibold text-primary-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-primary-300">
                  {item.actor.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.actor.avatarUrl}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </span>
                <div className="rounded-xl px-1 py-0.5">
                  <p className="text-sm text-slate-700 dark:text-zinc-200">
                    <span className="font-medium text-slate-900 dark:text-zinc-50">
                      {item.actor.name}
                    </span>{" "}
                    <span className="text-slate-500">
                      {formatActivityAction(item.action)}
                    </span>
                    {subject ? (
                      <>
                        {" "}
                        {href ? (
                          <Link
                            href={href}
                            className="font-medium text-primary-700 hover:underline dark:text-primary-300"
                          >
                            {subject}
                          </Link>
                        ) : (
                          <span className="font-medium">{subject}</span>
                        )}
                      </>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {format(parseISO(item.createdAt), "MMM d, yyyy · HH:mm")}
                    {item.project?.name ? ` · ${item.project.name}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}

      {feed.hasNextPage ? (
        <Button
          variant="outline"
          disabled={feed.isFetchingNextPage}
          onClick={() => void feed.fetchNextPage()}
        >
          {feed.isFetchingNextPage ? "Loading…" : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}
