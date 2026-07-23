"use client";

import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useArchiveWorkspace,
  useDeleteWorkspace,
  useTransferOwnership,
  useUnarchiveWorkspace,
  useUpdateWorkspace,
  useWorkspace,
  useWorkspaceCapabilities,
  useWorkspaceMembers,
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

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function WorkspaceSettingsPage({ params }: PageProps) {
  const { slug } = use(params);
  const { data, isLoading } = useWorkspace(slug);
  const caps = useWorkspaceCapabilities(slug);
  const { data: members = [] } = useWorkspaceMembers(slug);
  const update = useUpdateWorkspace(slug);
  const archive = useArchiveWorkspace(slug);
  const unarchive = useUnarchiveWorkspace(slug);
  const transfer = useTransferOwnership(slug);
  const remove = useDeleteWorkspace(slug);
  const [transferUserId, setTransferUserId] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

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

  const canEdit = caps.canManageSettings;
  const isOwner = data.role === "OWNER";
  const isArchived = Boolean(data.archivedAt);
  const transferCandidates = members.filter(
    (m) => m.role !== "OWNER" && m.userId !== data.ownerId,
  );

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Workspace settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          /{data.slug}
          {isArchived ? " · Archived" : ""}
        </p>
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

      {canEdit ? (
        <section className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
              Archive
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Archived workspaces stay available but are marked inactive.
            </p>
          </div>
          {isArchived ? (
            <Button
              type="button"
              variant="secondary"
              disabled={unarchive.isPending}
              onClick={() => unarchive.mutate()}
            >
              {unarchive.isPending ? "Restoring…" : "Unarchive workspace"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              disabled={archive.isPending}
              onClick={() => {
                if (confirm("Archive this workspace?")) archive.mutate();
              }}
            >
              {archive.isPending ? "Archiving…" : "Archive workspace"}
            </Button>
          )}
          {archive.error instanceof ApiError ? (
            <p className="text-sm text-danger-600">{archive.error.message}</p>
          ) : null}
          {unarchive.error instanceof ApiError ? (
            <p className="text-sm text-danger-600">{unarchive.error.message}</p>
          ) : null}
        </section>
      ) : null}

      {isOwner ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
              Transfer ownership
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              You will become an admin after transferring ownership.
            </p>
          </div>
          <select
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={transferUserId}
            onChange={(e) => setTransferUserId(e.target.value)}
          >
            <option value="">Select new owner…</option>
            {transferCandidates.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user.name} ({m.user.email})
              </option>
            ))}
          </select>
          <Button
            type="button"
            disabled={!transferUserId || transfer.isPending}
            onClick={() => {
              if (
                !confirm(
                  "Transfer ownership to the selected member? This cannot be undone easily.",
                )
              ) {
                return;
              }
              transfer.mutate(transferUserId, {
                onSuccess: () => setTransferUserId(""),
              });
            }}
          >
            {transfer.isPending ? "Transferring…" : "Transfer ownership"}
          </Button>
          {transfer.error instanceof ApiError ? (
            <p className="text-sm text-danger-600">{transfer.error.message}</p>
          ) : null}
        </section>
      ) : null}

      {isOwner ? (
        <section className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50/60 p-6 dark:border-rose-900/50 dark:bg-rose-950/20">
          <div>
            <h2 className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              Delete workspace
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Soft-deletes this workspace. Type{" "}
              <span className="font-mono">{data.slug}</span> to confirm.
            </p>
          </div>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={data.slug}
          />
          <Button
            type="button"
            variant="danger"
            disabled={deleteConfirm !== data.slug || remove.isPending}
            onClick={() => remove.mutate()}
          >
            {remove.isPending ? "Deleting…" : "Delete workspace"}
          </Button>
          {remove.error instanceof ApiError ? (
            <p className="text-sm text-danger-600">{remove.error.message}</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
