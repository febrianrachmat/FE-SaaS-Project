"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { ApiError } from "@/shared/types/api";
import {
  updateProjectSchema,
  type UpdateProjectInput,
} from "../schemas/project.schema";
import {
  useArchiveProject,
  useDeleteProject,
  useProject,
  useUnarchiveProject,
  useUpdateProject,
} from "../hooks/use-project";
import { ProjectAccessPanel } from "./project-access-panel";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
};

function toDateInputValue(iso: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function ProjectSettingsPanel({
  workspaceSlug,
  projectSlug,
}: Props) {
  const { data: project, isLoading } = useProject(workspaceSlug, projectSlug);
  const update = useUpdateProject(workspaceSlug, projectSlug);
  const archive = useArchiveProject(workspaceSlug, projectSlug);
  const unarchive = useUnarchiveProject(workspaceSlug, projectSlug);
  const remove = useDeleteProject(workspaceSlug, projectSlug);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
  });

  useEffect(() => {
    if (!project) return;
    reset({
      name: project.name,
      description: project.description ?? "",
      icon: project.icon ?? "",
      coverUrl: project.coverUrl ?? "",
      visibility: project.visibility,
      status: project.status === "ARCHIVED" ? "ACTIVE" : project.status,
      priority: project.priority,
      deadline: toDateInputValue(project.deadline),
    });
  }, [project, reset]);

  if (isLoading || !project) {
    return <Skeleton className="h-64 w-full max-w-lg" />;
  }

  const isArchived = Boolean(project.archivedAt);

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <Link
          href={`/app/w/${workspaceSlug}/projects/${projectSlug}`}
          className="mb-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary-600"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to project
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Project settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          /{project.slug}
          {isArchived ? " · Archived" : ""}
        </p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        onSubmit={handleSubmit(async (values) => {
          try {
            await update.mutateAsync({
              name: values.name,
              description: values.description?.trim()
                ? values.description.trim()
                : null,
              icon: values.icon?.trim() ? values.icon.trim() : null,
              coverUrl: values.coverUrl?.trim()
                ? values.coverUrl.trim()
                : null,
              visibility: values.visibility,
              status: isArchived ? "ARCHIVED" : values.status,
              priority: values.priority,
              deadline: values.deadline?.trim()
                ? new Date(values.deadline).toISOString()
                : null,
            });
          } catch {
            // shown below
          }
        })}
        noValidate
      >
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name ? (
            <p className="mt-1 text-xs text-danger-600">{errors.name.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="icon">Icon</Label>
          <Input id="icon" {...register("icon")} placeholder="📁" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" {...register("description")} />
        </div>
        <div>
          <Label htmlFor="coverUrl">Cover image URL</Label>
          <Input
            id="coverUrl"
            type="url"
            placeholder="https://…"
            {...register("coverUrl")}
          />
          {errors.coverUrl ? (
            <p className="mt-1 text-xs text-danger-600">
              {errors.coverUrl.message}
            </p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              disabled={isArchived}
              {...register("status")}
            >
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              {...register("priority")}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" type="date" {...register("deadline")} />
        </div>
        <div>
          <Label htmlFor="visibility">Visibility</Label>
          <select
            id="visibility"
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            {...register("visibility")}
          >
            <option value="WORKSPACE">Workspace — all members</option>
            <option value="PRIVATE">Private — invited members only</option>
          </select>
        </div>
        {update.error instanceof ApiError ? (
          <p className="text-sm text-danger-600">{update.error.message}</p>
        ) : null}
        {update.isSuccess && !update.isPending ? (
          <p className="text-sm text-success-600">Settings saved.</p>
        ) : null}
        <Button type="submit" disabled={!isDirty || update.isPending}>
          {update.isPending ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <ProjectAccessPanel
        workspaceSlug={workspaceSlug}
        projectSlug={projectSlug}
        project={project}
      />

      <section className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
            Archive
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Archived projects stay available but are marked inactive.
          </p>
        </div>
        {isArchived ? (
          <Button
            type="button"
            variant="secondary"
            disabled={unarchive.isPending}
            onClick={() => unarchive.mutate()}
          >
            {unarchive.isPending ? "Restoring…" : "Unarchive project"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            disabled={archive.isPending}
            onClick={() => {
              if (confirm("Archive this project?")) archive.mutate();
            }}
          >
            {archive.isPending ? "Archiving…" : "Archive project"}
          </Button>
        )}
        {archive.error instanceof ApiError ? (
          <p className="text-sm text-danger-600">{archive.error.message}</p>
        ) : null}
        {unarchive.error instanceof ApiError ? (
          <p className="text-sm text-danger-600">{unarchive.error.message}</p>
        ) : null}
      </section>

      <section className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50/60 p-6 dark:border-rose-900/50 dark:bg-rose-950/20">
        <div>
          <h2 className="text-sm font-semibold text-rose-700 dark:text-rose-300">
            Delete project
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Soft-deletes this project and its tasks. Type{" "}
            <span className="font-mono">{project.slug}</span> to confirm.
          </p>
        </div>
        <Input
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          placeholder={project.slug}
        />
        <Button
          type="button"
          variant="danger"
          disabled={deleteConfirm !== project.slug || remove.isPending}
          onClick={() => remove.mutate()}
        >
          {remove.isPending ? "Deleting…" : "Delete project"}
        </Button>
        {remove.error instanceof ApiError ? (
          <p className="text-sm text-danger-600">{remove.error.message}</p>
        ) : null}
      </section>
    </div>
  );
}
