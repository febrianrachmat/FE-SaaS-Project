"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Check, Copy, RefreshCw, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { ApiError } from "@/shared/types/api";
import {
  usePendingInvitations,
  useResendInvitation,
  useRevokeInvitation,
} from "../hooks/use-workspace";

type Props = {
  slug: string;
};

export function PendingInvitationsList({ slug }: Props) {
  const { data, isLoading, isError } = usePendingInvitations(slug);
  const revoke = useRevokeInvitation(slug);
  const resend = useResendInvitation(slug);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastLink, setLastLink] = useState<string | null>(null);

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (isError) {
    return (
      <p className="text-sm text-danger-600">Unable to load pending invites.</p>
    );
  }

  if (!data?.length) {
    return (
      <p className="text-sm text-slate-400">No pending invitations.</p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-zinc-800 dark:border-zinc-800">
        {data.map((inv) => (
          <li
            key={inv.id}
            className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-zinc-50">
                {inv.email}
              </p>
              <p className="text-xs text-slate-400">
                {inv.role.replaceAll("_", " ")} · expires{" "}
                {format(parseISO(inv.expiresAt), "MMM d, yyyy")}
                {inv.invitedBy ? ` · by ${inv.invitedBy.name}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={resend.isPending}
                onClick={async () => {
                  try {
                    const result = await resend.mutateAsync(inv.id);
                    setLastLink(result.inviteLink);
                    await navigator.clipboard.writeText(result.inviteLink);
                    setCopiedId(inv.id);
                  } catch {
                    // shown below
                  }
                }}
              >
                {copiedId === inv.id ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Link copied
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" /> Resend & copy
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={revoke.isPending}
                onClick={() => void revoke.mutateAsync(inv.id)}
              >
                <X className="h-3.5 w-3.5" />
                Revoke
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {lastLink ? (
        <p className="truncate text-xs text-slate-400">
          Latest link: {lastLink}
        </p>
      ) : null}

      {resend.error instanceof ApiError || revoke.error instanceof ApiError ? (
        <p className="text-sm text-danger-600" role="alert">
          {(resend.error instanceof ApiError && resend.error.message) ||
            (revoke.error instanceof ApiError && revoke.error.message)}
        </p>
      ) : null}
    </div>
  );
}
