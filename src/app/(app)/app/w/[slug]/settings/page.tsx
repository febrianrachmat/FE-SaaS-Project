"use client";

import { use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useUpdateWorkspace,
  useWorkspace,
} from "@/features/workspace";
import {
  updateWorkspaceSchema,
  type UpdateWorkspaceInput,
} from "@/features/workspace/schemas/workspace.schema";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { ApiError } from "@/shared/types/api";
import { useEffect } from "react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function WorkspaceSettingsPage({ params }: PageProps) {
  const { slug } = use(params);
  const { data, isLoading } = useWorkspace(slug);
  const update = useUpdateWorkspace(slug);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(updateWorkspaceSchema),
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        description: data.description ?? "",
        timezone: data.timezone,
      });
    }
  }, [data, reset]);

  if (isLoading || !data) {
    return <Skeleton className="h-64 w-full max-w-lg" />;
  }

  const canEdit = data.role === "ADMIN" || data.role === "OWNER";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Workspace settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">/{data.slug}</p>
      </div>

      {!canEdit ? (
        <p className="text-sm text-slate-500">
          Only admins and owners can edit workspace settings.
        </p>
      ) : (
        <form
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
          onSubmit={handleSubmit(async (values) => {
            try {
              await update.mutateAsync(values);
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
              <p className="mt-1 text-xs text-danger-600">
                {errors.name.message}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} />
          </div>
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" {...register("timezone")} />
          </div>
          {update.error instanceof ApiError ? (
            <p className="text-sm text-danger-600">{update.error.message}</p>
          ) : null}
          {update.isSuccess ? (
            <p className="text-sm text-success-600">Settings saved.</p>
          ) : null}
          <Button type="submit" disabled={!isDirty || update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      )}
    </div>
  );
}
