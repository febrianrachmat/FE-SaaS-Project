"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/shared/ui/button";
import { useAuthStore } from "@/features/auth";
import {
  useComments,
  useCreateComment,
  collabKeys,
} from "../hooks/use-collab";
import { collabApi } from "../api/collab.api";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/shared/ui/skeleton";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  taskId: string;
};

export function TaskComments({ workspaceSlug, projectSlug, taskId }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useComments(workspaceSlug, projectSlug, taskId);
  const create = useCreateComment(workspaceSlug, projectSlug, taskId);
  const [body, setBody] = useState("");
  const qc = useQueryClient();

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-500">Comments</p>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <ul className="space-y-3">
          {(data ?? []).map((c) => (
            <li key={c.id} className="rounded-lg bg-slate-50 p-3 dark:bg-zinc-900">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{c.author.name}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-zinc-300">
                    {c.body}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {format(parseISO(c.createdAt), "MMM d, HH:mm")}
                  </p>
                </div>
                {user?.id === c.author.id ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await collabApi.deleteComment(
                        workspaceSlug,
                        projectSlug,
                        taskId,
                        c.id,
                      );
                      void qc.invalidateQueries({
                        queryKey: collabKeys.comments(
                          workspaceSlug,
                          projectSlug,
                          taskId,
                        ),
                      });
                    }}
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
          {(data ?? []).length === 0 ? (
            <li className="text-sm text-slate-400">No comments yet.</li>
          ) : null}
        </ul>
      )}

      <form
        className="space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!body.trim()) return;
          await create.mutateAsync(body.trim());
          setBody("");
        }}
      >
        <textarea
          className="min-h-20 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Write a comment… Use @name to mention"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button type="submit" size="sm" disabled={create.isPending || !body.trim()}>
          {create.isPending ? "Posting…" : "Post comment"}
        </Button>
      </form>
    </div>
  );
}
