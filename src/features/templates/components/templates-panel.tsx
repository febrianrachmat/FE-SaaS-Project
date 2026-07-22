"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { ApiError } from "@/shared/types/api";
import { useProjects } from "@/features/project";
import {
  useApplyTemplate,
  useCreateTemplateFromProject,
  useDeleteTemplate,
  useTemplates,
} from "../hooks/use-templates";

type Props = { workspaceSlug: string };

export function TemplatesPanel({ workspaceSlug }: Props) {
  const router = useRouter();
  const { data: templates = [], isLoading } = useTemplates(workspaceSlug);
  const { data: projects = [] } = useProjects(workspaceSlug);
  const createFromProject = useCreateTemplateFromProject(workspaceSlug);
  const apply = useApplyTemplate(workspaceSlug);
  const remove = useDeleteTemplate(workspaceSlug);

  const [projectSlug, setProjectSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Templates
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Snapshot projects into reusable templates, then spin up new work in one
          click.
        </p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        onSubmit={(e) => {
          e.preventDefault();
          if (!projectSlug || !name.trim()) return;
          createFromProject.mutate(
            {
              projectSlug,
              name: name.trim(),
              ...(description.trim()
                ? { description: description.trim() }
                : {}),
            },
            {
              onSuccess: () => {
                setName("");
                setDescription("");
                setProjectSlug("");
              },
            },
          );
        }}
      >
        <div>
          <Label htmlFor="template-project">Create from project</Label>
          <select
            id="template-project"
            value={projectSlug}
            onChange={(e) => {
              setProjectSlug(e.target.value);
              const project = projects.find((p) => p.slug === e.target.value);
              if (project && !name.trim()) {
                setName(`${project.name} template`);
              }
            }}
            className="mt-1.5 flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Select a project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.icon ? `${p.icon} ` : ""}
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="template-name">Template name</Label>
          <Input
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sprint kickoff"
            maxLength={100}
          />
        </div>
        <div>
          <Label htmlFor="template-description">Description</Label>
          <Input
            id="template-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes"
            maxLength={2000}
          />
        </div>
        {createFromProject.error instanceof ApiError ? (
          <p className="text-sm text-danger-600">
            {createFromProject.error.message}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={
            createFromProject.isPending || !projectSlug || !name.trim()
          }
        >
          {createFromProject.isPending ? "Saving…" : "Save template"}
        </Button>
      </form>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : templates.length === 0 ? (
        <EmptyState
          title="No templates yet"
          description="Pick a project above to capture its tasks as a reusable template."
        />
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {templates.map((template) => (
            <li
              key={template.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-slate-900 dark:text-zinc-50">
                  {template.icon ? `${template.icon} ` : null}
                  {template.name}
                </p>
                {template.description ? (
                  <p className="text-sm text-slate-500">
                    {template.description}
                  </p>
                ) : null}
                <p className="text-xs text-slate-400">
                  {template.taskCount} task
                  {template.taskCount === 1 ? "" : "s"}
                  {template.payload.project.name
                    ? ` · from “${template.payload.project.name}”`
                    : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={apply.isPending}
                  onClick={() => {
                    apply.mutate(
                      { templateId: template.id },
                      {
                        onSuccess: (project) => {
                          router.push(
                            `/app/w/${workspaceSlug}/projects/${project.slug}`,
                          );
                        },
                      },
                    );
                  }}
                >
                  {apply.isPending ? "Applying…" : "Apply"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-danger-600"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (
                      window.confirm(`Delete template “${template.name}”?`)
                    ) {
                      remove.mutate(template.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {apply.error instanceof ApiError ? (
        <p className="text-sm text-danger-600">{apply.error.message}</p>
      ) : null}

      <p className="text-center text-xs text-slate-400">
        Applied projects appear under{" "}
        <Link
          href={`/app/w/${workspaceSlug}/projects`}
          className="underline underline-offset-2"
        >
          Projects
        </Link>
        .
      </p>
    </div>
  );
}
