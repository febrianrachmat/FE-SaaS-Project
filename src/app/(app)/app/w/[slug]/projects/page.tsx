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

type Props = { params: Promise<{ slug: string }> };

export default function ProjectsPage({ params }: Props) {
  const { slug } = use(params);
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
        <Button onClick={() => setShowCreate((v) => !v)}>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      {showCreate ? (
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
            description="Create a project to start tracking tasks, or try a sample workspace."
            actionLabel="Create project"
            onAction={() => setShowCreate(true)}
            secondaryActionLabel={
              sample.isPending ? "Creating sample…" : "Create sample project"
            }
            onSecondaryAction={() => sample.mutate()}
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
