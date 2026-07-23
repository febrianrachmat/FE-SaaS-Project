"use client";

import { Skeleton } from "@/shared/ui/skeleton";
import { ApiError } from "@/shared/types/api";
import type { SecurityAuditEvent } from "../api/auth.api";
import { useSecurityLog } from "../hooks/use-auth";

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Signed in",
  LOGIN_FAILED: "Failed sign-in",
  LOGOUT: "Signed out",
  SESSION_REVOKED: "Session revoked",
  SESSIONS_REVOKED_OTHERS: "Other sessions revoked",
  PASSWORD_CHANGED: "Password changed",
  API_KEY_CREATED: "API key created",
  API_KEY_REVOKED: "API key revoked",
  API_KEY_ROTATED: "API key rotated",
  ROLE_CHANGED: "Member role changed",
};

function formatWhen(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SecurityAuditList({
  events,
  emptyLabel = "No security events yet",
}: {
  events: SecurityAuditEvent[];
  emptyLabel?: string;
}) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-400">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
      {events.map((event) => (
        <li key={event.id} className="py-3">
          <p className="text-sm font-medium text-slate-900 dark:text-zinc-50">
            {ACTION_LABELS[event.action] ?? event.action}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {formatWhen(event.createdAt)}
            {event.ip ? ` · ${event.ip}` : ""}
            {event.actor ? ` · ${event.actor.name}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function AccountSecurityLogPanel() {
  const { data = [], isLoading, isError, error } = useSecurityLog();

  if (isLoading) return <Skeleton className="h-28 w-full" />;
  if (isError) {
    return (
      <p className="text-sm text-danger-600">
        {error instanceof ApiError ? error.message : "Failed to load security log"}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-slate-700 dark:text-zinc-300">
        Recent security activity
      </h3>
      <SecurityAuditList events={data} />
    </div>
  );
}
