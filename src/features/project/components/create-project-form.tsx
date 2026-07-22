"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ApiError } from "@/shared/types/api";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "../schemas/project.schema";
import { useCreateProject } from "../hooks/use-project";

type Props = { workspaceSlug: string };

export function CreateProjectForm({ workspaceSlug }: Props) {
  const create = useCreateProject(workspaceSlug);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "📁",
      priority: "MEDIUM",
      visibility: "WORKSPACE",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        try {
          await create.mutateAsync(values);
        } catch {
          // shown below
        }
      })}
      noValidate
    >
      <div>
        <Label htmlFor="name">Project name</Label>
        <Input id="name" {...register("name")} />
        {errors.name ? (
          <p className="mt-1 text-xs text-danger-600">{errors.name.message}</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="icon">Icon</Label>
        <Input id="icon" {...register("icon")} />
      </div>
      <div>
        <Label htmlFor="slug">Slug (optional)</Label>
        <Input id="slug" placeholder="website-redesign" {...register("slug")} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} />
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
      {create.error instanceof ApiError ? (
        <p className="text-sm text-danger-600">{create.error.message}</p>
      ) : null}
      <Button type="submit" disabled={create.isPending}>
        {create.isPending ? "Creating…" : "Create project"}
      </Button>
    </form>
  );
}
