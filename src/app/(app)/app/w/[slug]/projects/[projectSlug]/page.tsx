"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BulkActionBar,
  CreateTaskForm,
  KanbanBoard,
  TaskDetailPanel,
  TaskRow,
  useProject,
  useTasks,
  useToggleFavorite,
  useUpdateTask,
} from "@/features/project";
import { ProjectNextStepsBanner } from "@/features/project/components/project-next-steps-banner";
import {
  TaskFilterBar,
  filtersFromSearchParams,
  filtersToSearchParams,
  type TaskFilters,
} from "@/features/project/components/task-filter-bar";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { PresenceAvatars } from "@/shared/components/presence-avatars";
import { usePresence } from "@/shared/hooks/use-presence";
import { useWorkspaceCapabilities } from "@/features/workspace";
import {
  onboardingFlagKey,
  writeFlag,
} from "@/shared/lib/onboarding-storage";
import { ArrowLeft, LayoutGrid, List, Settings, Star } from "lucide-react";
import type { TaskStatus } from "@/shared/types/domain";
import { cn } from "@/shared/lib/utils";

type Props = {
  params: Promise<{ slug: string; projectSlug: string }>;
};

export default function ProjectDetailPage({ params }: Props) {
  const { slug, projectSlug } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const caps = useWorkspaceCapabilities(slug);
  const { data: project, isLoading } = useProject(slug, projectSlug);
  const [filters, setFilters] = useState<TaskFilters>(() =>
    filtersFromSearchParams(new URLSearchParams(searchParams.toString())),
  );
  const boardFilters = {
    priority: filters.priority,
    q: filters.q,
    assigneeId: filters.assigneeId,
    labelId: filters.labelId,
    cycleId: filters.cycleId,
  };
  const listFilters = filters;
  const { data: tasks, isLoading: tasksLoading } = useTasks(
    slug,
    projectSlug,
    listFilters,
  );
  const favorite = useToggleFavorite(slug, projectSlug);
  const updateTask = useUpdateTask(slug, projectSlug);
  const onlineUsers = usePresence(slug, projectSlug);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"board" | "list">("board");

  useEffect(() => {
    const taskId = searchParams.get("task");
    if (taskId) setSelectedTaskId(taskId);
  }, [searchParams]);

  useEffect(() => {
    const next = filtersFromSearchParams(
      new URLSearchParams(searchParams.toString()),
    );
    setFilters(next);
  }, [searchParams]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [view, filters.status, filters.priority, filters.q, filters.assigneeId, filters.labelId, filters.cycleId]);

  useEffect(() => {
    writeFlag(onboardingFlagKey(slug, "visited-board"));
  }, [slug]);

  function updateFilters(next: TaskFilters) {
    setFilters(next);
    const params = filtersToSearchParams(next);
    const taskId = searchParams.get("task");
    if (taskId) params.set("task", taskId);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggleSelect(taskId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }

  if (isLoading || !project) {
    return <Skeleton className="h-64 w-full" />;
  }

  const isArchived = Boolean(project.archivedAt);
  const metaParts = [
    project.description || "No description",
    `${project.taskCount ?? 0} tasks`,
    project.visibility === "PRIVATE" ? "Private" : "Workspace",
    project.status.replace("_", " ").toLowerCase(),
    project.priority.toLowerCase(),
    project.deadline
      ? `Due ${new Date(project.deadline).toLocaleDateString()}`
      : null,
    isArchived ? "Archived" : null,
  ].filter(Boolean);

  return (
    <div className="flex h-[calc(100vh-3.5rem-3rem)] gap-0">
      <div className="min-w-0 flex-1 space-y-6 overflow-y-auto pr-2">
        {project.coverUrl ? (
          <div
            className="-mx-1 h-28 overflow-hidden rounded-xl bg-slate-100 bg-cover bg-center dark:bg-zinc-900"
            style={{ backgroundImage: `url(${project.coverUrl})` }}
            role="img"
            aria-label={`${project.name} cover`}
          />
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              href={`/app/w/${slug}/projects`}
              className="mb-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary-600"
            >
              <ArrowLeft className="h-3 w-3" />
              Projects
            </Link>
            <h1 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-2xl font-semibold">
              <span aria-hidden>{project.icon ?? "📁"}</span>
              {project.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{metaParts.join(" · ")}</p>
          </div>
          <div className="flex items-center gap-2">
            <PresenceAvatars users={onlineUsers} />
            <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-zinc-700">
              <Button
                variant="ghost"
                size="sm"
                className={cn(view === "board" && "bg-slate-100 dark:bg-zinc-800")}
                onClick={() => setView("board")}
                aria-pressed={view === "board"}
              >
                <LayoutGrid className="h-4 w-4" />
                Board
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(view === "list" && "bg-slate-100 dark:bg-zinc-800")}
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => favorite.mutate()}
              disabled={favorite.isPending}
            >
              <Star
                className={`h-4 w-4 ${project.isFavorite ? "fill-amber-400 text-amber-400" : ""}`}
              />
              {project.isFavorite ? "Favorited" : "Favorite"}
            </Button>
            <Link
              href={`/app/w/${slug}/projects/${projectSlug}/settings`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>

        {caps.isViewOnly ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            View only — your guest role can browse this project but not edit
            tasks or leave comments.
          </p>
        ) : null}

        {caps.canCreateTask || caps.canInvite ? (
          <ProjectNextStepsBanner
            workspaceSlug={slug}
            projectSlug={projectSlug}
          />
        ) : null}

        <CreateTaskForm workspaceSlug={slug} projectSlug={projectSlug} />

        <TaskFilterBar
          workspaceSlug={slug}
          value={filters}
          onChange={updateFilters}
          hideStatus={view === "board"}
        />

        {view === "board" ? (
          <KanbanBoard
            workspaceSlug={slug}
            projectSlug={projectSlug}
            filters={boardFilters}
            onSelectTask={setSelectedTaskId}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onRequestCreateTask={() => {
              document.getElementById("task-title")?.focus();
              document
                .getElementById("create-task")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
        ) : tasksLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onClick={() => setSelectedTaskId(task.id)}
                onStatusChange={
                  caps.canUpdateTask
                    ? (status: TaskStatus) =>
                        updateTask.mutate({ taskId: task.id, status })
                    : undefined
                }
                selected={selectedIds.has(task.id)}
                onToggleSelect={
                  caps.canUpdateTask
                    ? () => toggleSelect(task.id)
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matching tasks"
            description={
              caps.canCreateTask
                ? "Try clearing filters or add a new task."
                : "Try clearing filters to see more tasks."
            }
            actionLabel={caps.canCreateTask ? "Create a task" : undefined}
            onAction={
              caps.canCreateTask
                ? () => {
                    document.getElementById("task-title")?.focus();
                    document
                      .getElementById("create-task")
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                : undefined
            }
          />
        )}

        <BulkActionBar
          workspaceSlug={slug}
          projectSlug={projectSlug}
          selectedIds={[...selectedIds]}
          onClear={() => setSelectedIds(new Set())}
        />
      </div>

      {selectedTaskId ? (
        <TaskDetailPanel
          workspaceSlug={slug}
          projectSlug={projectSlug}
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      ) : null}
    </div>
  );
}
