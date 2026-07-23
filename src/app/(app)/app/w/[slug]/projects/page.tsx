"use client";

import Link from "next/link";
import { use } from "react";
import {
  CreateProjectForm,
  useCreateSampleProject,
  useProjects,
} from "@/features/project";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { ApiError } from "@/shared/types/api";
import { FolderKanban, Plus, Star } from "lucide-react";
import { useState } from "react";
import { useWorkspaceCapabilities } from "@/features/workspace";

type Props = { params: Promise<{ slug: string }> };

export default function ProjectsPage({ params }: Props) {
  const { slug } = use(params);
  const caps = useWorkspaceCapabilities(slug);
  const { data, isLoading } = useProjects(slug);
  const sample = useCreateSampleProject(slug);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">Workspace /{slug}</p>
        </div>
        {caps.canCreateProject ? (
          <Button onClick={() => setShowCreate((v) => !v)}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        ) : null}
      </div>

      {showCreate && caps.canCreateProject ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <CreateProjectForm workspaceSlug={slug} />
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((project) => (
            <Link
              key={project.id}
              href={`/app/w/${slug}/projects/${project.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-primary-300 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden>
                    {project.icon ?? "📁"}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-zinc-50">
                      {project.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {project.taskCount ?? 0} tasks · {project.priority}
                    </p>
                  </div>
                </div>
                {project.isFavorite ? (
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                ) : null}
              </div>
              {project.description ? (
                <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                  {project.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <EmptyState
            icon={<FolderKanban className="h-10 w-10" />}
            title="No projects yet"
            description={
              caps.canCreateProject
                ? "Create a project to start tracking tasks, or try a sample workspace."
                : "No projects are visible yet. Ask a teammate to create one."
            }
            actionLabel={caps.canCreateProject ? "Create project" : undefined}
            onAction={
              caps.canCreateProject ? () => setShowCreate(true) : undefined
            }
            secondaryActionLabel={
              caps.canCreateProject
                ? sample.isPending
                  ? "Creating sample…"
                  : "Create sample project"
                : undefined
            }
            onSecondaryAction={
              caps.canCreateProject ? () => sample.mutate() : undefined
            }
          />
          {sample.error instanceof ApiError ? (
            <p className="text-center text-sm text-danger-600">
              {sample.error.message}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
