"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { FileText, Paperclip, Trash2, X } from "lucide-react";
import { useAttachments, collabKeys } from "../hooks/use-collab";
import { collabApi, type Attachment } from "../api/collab.api";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  taskId: string;
};

function isPdf(a: Attachment) {
  return (
    a.mimeType === "application/pdf" ||
    a.fileName.toLowerCase().endsWith(".pdf")
  );
}

function attachmentHref(
  a: Attachment,
  workspaceSlug: string,
  projectSlug: string,
  taskId: string,
) {
  return (
    a.url ??
    collabApi.downloadUrl(workspaceSlug, projectSlug, taskId, a.id)
  );
}

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
  const [preview, setPreview] = useState<Attachment | null>(null);

  const refresh = () =>
    qc.invalidateQueries({
      queryKey: collabKeys.attachments(workspaceSlug, projectSlug, taskId),
    });

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

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
          accept="image/*,application/pdf,.pdf"
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
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(data ?? []).map((a) => {
            const href = attachmentHref(
              a,
              workspaceSlug,
              projectSlug,
              taskId,
            );
            const canPreview = a.isImage || isPdf(a);
            return (
              <li
                key={a.id}
                className="overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-800"
              >
                {a.isImage ? (
                  <button
                    type="button"
                    className="block w-full"
                    onClick={() => setPreview(a)}
                    aria-label={`Preview ${a.fileName}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={href}
                      alt={a.fileName}
                      className="h-28 w-full object-cover bg-slate-100 dark:bg-zinc-900"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={cn(
                      "flex h-28 w-full flex-col items-center justify-center gap-2 bg-slate-50 text-slate-500 dark:bg-zinc-900",
                      canPreview && "hover:bg-slate-100 dark:hover:bg-zinc-800",
                    )}
                    onClick={() => (canPreview ? setPreview(a) : window.open(href, "_blank"))}
                    aria-label={
                      canPreview ? `Preview ${a.fileName}` : `Open ${a.fileName}`
                    }
                  >
                    <FileText className="h-8 w-8" />
                    <span className="px-2 text-center text-[11px]">
                      {isPdf(a) ? "PDF preview" : "Open file"}
                    </span>
                  </button>
                )}
                <div className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                  <a
                    href={href}
                    className="min-w-0 truncate text-primary-600 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                    title={a.fileName}
                  >
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
                </div>
              </li>
            );
          })}
          {(data ?? []).length === 0 ? (
            <li className="col-span-full text-sm text-slate-400">
              No files yet.
            </li>
          ) : null}
        </ul>
      )}

      {preview ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close preview"
            onClick={() => setPreview(null)}
          />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-950">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-zinc-800">
              <p className="truncate text-sm font-medium">{preview.fileName}</p>
              <div className="flex items-center gap-2">
                <a
                  href={attachmentHref(
                    preview,
                    workspaceSlug,
                    projectSlug,
                    taskId,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary-600 hover:underline"
                >
                  Open
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close preview"
                  onClick={() => setPreview(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-2 dark:bg-zinc-900">
              {preview.isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={attachmentHref(
                    preview,
                    workspaceSlug,
                    projectSlug,
                    taskId,
                  )}
                  alt={preview.fileName}
                  className="mx-auto max-h-[75vh] max-w-full object-contain"
                />
              ) : isPdf(preview) ? (
                <iframe
                  title={preview.fileName}
                  src={attachmentHref(
                    preview,
                    workspaceSlug,
                    projectSlug,
                    taskId,
                  )}
                  className="h-[75vh] w-full rounded-lg bg-white"
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
