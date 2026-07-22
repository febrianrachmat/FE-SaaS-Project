"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { ApiError } from "@/shared/types/api";
import { useAuthStore } from "@/features/auth";
import {
  useAcceptInvitation,
  useInvitationPreview,
} from "../hooks/use-workspace";

export function AcceptInvitationPanel() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const preview = useInvitationPreview(token);
  const accept = useAcceptInvitation();

  const returnPath = `/invitations/accept?token=${encodeURIComponent(token)}`;
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;
  const registerHref = `/register?next=${encodeURIComponent(returnPath)}`;

  useEffect(() => {
    if (
      authStatus === "authenticated" &&
      token.length >= 20 &&
      !accept.isPending &&
      !accept.isSuccess &&
      !accept.isError
    ) {
      void accept.mutateAsync(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, token]);

  if (!token) {
    return (
      <p className="mt-6 text-sm text-danger-600">Missing invitation token.</p>
    );
  }

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (authStatus !== "authenticated") {
    return (
      <div className="mt-6 space-y-4">
        {preview.isLoading ? <Skeleton className="h-20 w-full" /> : null}
        {preview.data ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-slate-700 dark:text-zinc-200">
              You&apos;re invited to join{" "}
              <span className="font-semibold">{preview.data.workspace.name}</span>{" "}
              as {preview.data.role.replaceAll("_", " ").toLowerCase()}.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Sent to {preview.data.email} · expires{" "}
              {format(parseISO(preview.data.expiresAt), "MMM d, yyyy")}
            </p>
          </div>
        ) : null}
        {preview.isError ? (
          <p className="text-sm text-danger-600" role="alert">
            {preview.error instanceof ApiError
              ? preview.error.message
              : "This invitation is invalid or expired."}
          </p>
        ) : null}
        <p className="text-sm text-slate-500">
          Sign in with the invited email to accept.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href={loginHref}>
            <Button>Sign in to accept</Button>
          </Link>
          <Link href={registerHref}>
            <Button variant="outline">Create account</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (accept.isPending || (!accept.isSuccess && !accept.isError)) {
    return (
      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <p className="text-xs text-slate-400">
          Accepting as {user?.email}…
        </p>
      </div>
    );
  }

  if (accept.isError) {
    const message =
      accept.error instanceof ApiError
        ? accept.error.message
        : "Unable to accept invitation";
    const wrongEmail = /different email/i.test(message);

    return (
      <div className="mt-8 space-y-4">
        <p className="text-sm text-danger-600" role="alert">
          {message}
        </p>
        {wrongEmail && preview.data ? (
          <p className="text-sm text-slate-500">
            This invite was sent to <strong>{preview.data.email}</strong>, but
            you are signed in as <strong>{user?.email}</strong>.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Link href="/app">
            <Button variant="outline">Go to app</Button>
          </Link>
          {wrongEmail ? (
            <Link href={`/login?next=${encodeURIComponent(returnPath)}`}>
              <Button>Switch account</Button>
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <p className="text-sm text-success-600" role="status">
        {accept.data?.message}. Joined {accept.data?.workspace.name}.
      </p>
      <Link href={`/app/w/${accept.data?.workspace.slug}`}>
        <Button>Open workspace</Button>
      </Link>
    </div>
  );
}
