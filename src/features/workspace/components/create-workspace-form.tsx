"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ApiError } from "@/shared/types/api";
import {
  createWorkspaceSchema,
  type CreateWorkspaceInput,
} from "../schemas/workspace.schema";
import { useCreateWorkspace } from "../hooks/use-workspace";

export function CreateWorkspaceForm() {
  const create = useCreateWorkspace();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "", slug: "", description: "", timezone: "UTC" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
    } catch {
      // shown below
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="name">Workspace name</Label>
        <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
        {errors.name ? (
          <p className="mt-1 text-xs text-danger-600">{errors.name.message}</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="slug">Slug (optional)</Label>
        <Input
          id="slug"
          placeholder="acme-studio"
          {...register("slug")}
          aria-invalid={!!errors.slug}
        />
        {errors.slug ? (
          <p className="mt-1 text-xs text-danger-600">{errors.slug.message}</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} />
      </div>
      {create.error instanceof ApiError ? (
        <p className="text-sm text-danger-600" role="alert">
          {create.error.message}
        </p>
      ) : null}
      <Button type="submit" disabled={create.isPending}>
        {create.isPending ? "Creating…" : "Create workspace"}
      </Button>
    </form>
  );
}
