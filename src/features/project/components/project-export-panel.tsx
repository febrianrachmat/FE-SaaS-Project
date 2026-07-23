"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ApiError } from "@/shared/types/api";
import { projectApi } from "../api/project.api";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
};

export function ProjectExportPanel({ workspaceSlug, projectSlug }: Props) {
  const [pending, setPending] = useState<"csv" | "json" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function download(format: "csv" | "json") {
    setPending(format);
    setError(null);
    try {
      await projectApi.exportProject(workspaceSlug, projectSlug, format);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Export failed",
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
          Export
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Download this project’s tasks as CSV (spreadsheet) or JSON (full
          backup).
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={pending !== null}
          onClick={() => void download("csv")}
        >
          <Download className="h-3.5 w-3.5" />
          {pending === "csv" ? "Downloading…" : "Export CSV"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending !== null}
          onClick={() => void download("json")}
        >
          <Download className="h-3.5 w-3.5" />
          {pending === "json" ? "Downloading…" : "Export JSON"}
        </Button>
      </div>
      {error ? <p className="text-sm text-danger-600">{error}</p> : null}
    </section>
  );
}
