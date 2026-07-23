"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { ApiError } from "@/shared/types/api";
import { LABEL_COLORS } from "./label-chips";
import {
  useCreateLabel,
  useDeleteLabel,
  useLabels,
  useUpdateLabel,
} from "../hooks/use-project";
import { cn } from "@/shared/lib/utils";

type Props = { workspaceSlug: string };

export function LabelsPanel({ workspaceSlug }: Props) {
  const { data: labels = [], isLoading } = useLabels(workspaceSlug);
  const create = useCreateLabel(workspaceSlug);
  const update = useUpdateLabel(workspaceSlug);
  const remove = useDeleteLabel(workspaceSlug);

  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(LABEL_COLORS[0]!);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState<string>(LABEL_COLORS[0]!);

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Labels
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Workspace-wide labels used across all projects.
        </p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          create.mutate(
            { name: name.trim(), color },
            {
              onSuccess: () => {
                setName("");
                setColor(LABEL_COLORS[0]!);
              },
            },
          );
        }}
      >
        <div>
          <Label htmlFor="label-name">New label</Label>
          <Input
            id="label-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bug, Feature, Design…"
            maxLength={40}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
            Color
          </p>
          <div className="flex flex-wrap gap-2">
            {LABEL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={cn(
                  "h-7 w-7 rounded-full border-2 border-transparent",
                  color === c && "ring-2 ring-slate-400 ring-offset-1",
                )}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
        {create.error instanceof ApiError ? (
          <p className="text-sm text-danger-600">{create.error.message}</p>
        ) : null}
        <Button type="submit" disabled={create.isPending || !name.trim()}>
          {create.isPending ? "Creating…" : "Create label"}
        </Button>
      </form>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : labels.length === 0 ? (
        <EmptyState
          title="No labels yet"
          description="Create labels to organize tasks across projects."
        />
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {labels.map((label) => (
            <li key={label.id} className="px-4 py-3">
              {editingId === label.id ? (
                <div className="space-y-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={40}
                  />
                  <div className="flex flex-wrap gap-2">
                    {LABEL_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={cn(
                          "h-6 w-6 rounded-full",
                          editColor === c &&
                            "ring-2 ring-slate-400 ring-offset-1",
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => setEditColor(c)}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={update.isPending || !editName.trim()}
                      onClick={() =>
                        update.mutate(
                          {
                            labelId: label.id,
                            name: editName.trim(),
                            color: editColor,
                          },
                          { onSuccess: () => setEditingId(null) },
                        )
                      }
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <p className="truncate text-sm font-medium">{label.name}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(label.id);
                        setEditName(label.name);
                        setEditColor(label.color);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (
                          confirm(
                            `Delete label "${label.name}"? It will be removed from all tasks.`,
                          )
                        ) {
                          remove.mutate(label.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
