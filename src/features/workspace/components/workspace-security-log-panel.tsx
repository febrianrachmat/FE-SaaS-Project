"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/shared/ui/skeleton";
import { ApiError } from "@/shared/types/api";
import { SecurityAuditList } from "@/features/auth/components/security-audit-panel";
import type { SecurityAuditEvent } from "@/features/auth/api/auth.api";
import { workspaceApi } from "../api/workspace.api";

type Props = { workspaceSlug: string };

export function WorkspaceSecurityLogPanel({ workspaceSlug }: Props) {
  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ["workspace-security-log", workspaceSlug],
    queryFn: () => workspaceApi.listSecurityLog(workspaceSlug),
    enabled: !!workspaceSlug,
  });

  if (isLoading) return <Skeleton className="h-28 w-full" />;
  if (isError) {
    return (
      <p className="text-sm text-danger-600">
        {error instanceof ApiError
          ? error.message
          : "Failed to load security log"}
      </p>
    );
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-zinc-300">
          Security log
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          API key and permission changes in this workspace.
        </p>
      </div>
      <SecurityAuditList
        events={data as SecurityAuditEvent[]}
        emptyLabel="No workspace security events yet"
      />
    </section>
  );
}
