"use client";

import { formatDistanceToNow, parseISO } from "date-fns";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { ApiError } from "@/shared/types/api";
import {
  useRevokeOtherSessions,
  useRevokeSession,
  useSessions,
} from "../hooks/use-auth";
import type { AuthSession } from "../api/auth.api";

function parseDevice(userAgent: string | null): {
  label: string;
  kind: "desktop" | "mobile" | "tablet";
} {
  if (!userAgent) {
    return { label: "Unknown device", kind: "desktop" };
  }
  const ua = userAgent;
  const isTablet = /iPad|Tablet/i.test(ua);
  const isMobile = !isTablet && /Mobile|Android|iPhone/i.test(ua);

  let browser = "Browser";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";

  let os = "Unknown OS";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return {
    label: `${browser} on ${os}`,
    kind: isTablet ? "tablet" : isMobile ? "mobile" : "desktop",
  };
}

function DeviceIcon({ kind }: { kind: "desktop" | "mobile" | "tablet" }) {
  if (kind === "mobile") return <Smartphone className="h-4 w-4" />;
  if (kind === "tablet") return <Tablet className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
}

function SessionRow({
  session,
  onRevoke,
  revoking,
}: {
  session: AuthSession;
  onRevoke: () => void;
  revoking: boolean;
}) {
  const device = parseDevice(session.userAgent);
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3 dark:border-zinc-800">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 text-slate-400">
          <DeviceIcon kind={device.kind} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-zinc-50">
            {device.label}
            {session.isCurrent ? (
              <span className="ml-2 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase dark:bg-emerald-950/40 dark:text-emerald-300">
                This device
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {session.ip ? `${session.ip} · ` : ""}
            Signed in{" "}
            {formatDistanceToNow(parseISO(session.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
      {!session.isCurrent ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-danger-600"
          disabled={revoking}
          onClick={onRevoke}
        >
          Revoke
        </Button>
      ) : null}
    </li>
  );
}

export function ActiveSessionsPanel() {
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();

  const list = sessions.data ?? [];
  const otherCount = list.filter((s) => !s.isCurrent).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-zinc-50">
            Active sessions
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Devices signed in to your account. Revoke any you don’t recognize.
          </p>
        </div>
        {otherCount > 0 ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={revokeOthers.isPending}
            onClick={() => {
              if (
                window.confirm(
                  `Sign out of ${otherCount} other session${otherCount === 1 ? "" : "s"}?`,
                )
              ) {
                revokeOthers.mutate();
              }
            }}
          >
            {revokeOthers.isPending ? "Revoking…" : "Revoke other sessions"}
          </Button>
        ) : null}
      </div>

      {sessions.isLoading ? <Skeleton className="h-24 w-full" /> : null}

      {sessions.isError ? (
        <p className="text-sm text-danger-600">
          {sessions.error instanceof ApiError
            ? sessions.error.message
            : "Could not load sessions."}
        </p>
      ) : null}

      {!sessions.isLoading && list.length === 0 ? (
        <p className="text-sm text-slate-500">No active sessions found.</p>
      ) : null}

      {list.length > 0 ? (
        <ul className="space-y-2">
          {list.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              revoking={revoke.isPending}
              onRevoke={() => {
                if (
                  window.confirm(
                    "Revoke this session? That device will need to sign in again.",
                  )
                ) {
                  revoke.mutate(session.id);
                }
              }}
            />
          ))}
        </ul>
      ) : null}

      {revoke.error instanceof ApiError ? (
        <p className="text-sm text-danger-600">{revoke.error.message}</p>
      ) : null}
      {revokeOthers.error instanceof ApiError ? (
        <p className="text-sm text-danger-600">{revokeOthers.error.message}</p>
      ) : null}
      {revokeOthers.isSuccess ? (
        <p className="text-sm text-success-600">Other sessions revoked.</p>
      ) : null}
    </div>
  );
}
