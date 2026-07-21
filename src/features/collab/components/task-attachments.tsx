"use client";

import { useRef } from "react";
import { Button } from "@/shared/ui/button";
import { Paperclip, Trash2 } from "lucide-react";
import { useAttachments, collabKeys } from "../hooks/use-collab";
import { collabApi } from "../api/collab.api";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/shared/ui/skeleton";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  taskId: string;
};

export function TaskAttachments({
  workspaceSlug,
  projectSlug,
  taskId,
}: Props) {
  const { data, isLoading } = useAttachments(
    workspaceSlug,
    projectSlug,
    taskId,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const refresh = () =>
    qc.invalidateQueries({
      queryKey: collabKeys.attachments(workspaceSlug, projectSlug, taskId),
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">Attachments</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip className="h-3.5 w-3.5" />
          Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            await collabApi.uploadAttachment(
              workspaceSlug,
              projectSlug,
              taskId,
              file,
            );
            e.target.value = "";
            void refresh();
          }}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-12 w-full" />
      ) : (
        <ul className="space-y-2">
          {(data ?? []).map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <a
                href={collabApi.downloadUrl(
                  workspaceSlug,
                  projectSlug,
                  taskId,
                  a.id,
                )}
                className="min-w-0 truncate text-primary-600 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {a.isImage ? "🖼️ " : "📄 "}
                {a.fileName}
              </a>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete attachment"
                onClick={async () => {
                  await collabApi.deleteAttachment(
                    workspaceSlug,
                    projectSlug,
                    taskId,
                    a.id,
                  );
                  void refresh();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
          {(data ?? []).length === 0 ? (
            <li className="text-sm text-slate-400">No files yet.</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
