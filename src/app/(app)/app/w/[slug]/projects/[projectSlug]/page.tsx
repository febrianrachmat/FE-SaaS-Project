"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  CreateTaskForm,
  TaskDetailPanel,
  TaskRow,
  useProject,
  useTasks,
  useToggleFavorite,
  useUpdateTask,
} from "@/features/project";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { ArrowLeft, Star } from "lucide-react";
import type { TaskStatus } from "@/shared/types/domain";

type Props = {
  params: Promise<{ slug: string; projectSlug: string }>;
};

export default function ProjectDetailPage({ params }: Props) {
  const { slug, projectSlug } = use(params);
  const { data: project, isLoading } = useProject(slug, projectSlug);
  const { data: tasks, isLoading: tasksLoading } = useTasks(slug, projectSlug);
  const favorite = useToggleFavorite(slug, projectSlug);
  const updateTask = useUpdateTask(slug, projectSlug);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  if (isLoading || !project) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem-3rem)] gap-0">
      <div className="min-w-0 flex-1 space-y-6 overflow-y-auto pr-2">
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
            <p className="mt-1 text-sm text-slate-500">
              {project.description || "No description"} · {project.taskCount ?? 0}{" "}
              tasks
            </p>
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
        </div>

        <CreateTaskForm workspaceSlug={slug} projectSlug={projectSlug} />

        {tasksLoading ? (
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
                onStatusChange={(status: TaskStatus) =>
                  updateTask.mutate({ taskId: task.id, status })
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No tasks yet"
            description="Add your first task to start tracking work."
          />
        )}
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
