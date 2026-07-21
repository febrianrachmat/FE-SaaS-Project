"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { ApiError } from "@/shared/types/api";
import { useAcceptInvitation } from "../hooks/use-workspace";

export function AcceptInvitationPanel() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const accept = useAcceptInvitation();

  useEffect(() => {
    if (
      token.length >= 20 &&
      !accept.isPending &&
      !accept.isSuccess &&
      !accept.isError
    ) {
      void accept.mutateAsync(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <p className="mt-6 text-sm text-danger-600">
        Missing invitation token.
      </p>
    );
  }

  if (accept.isPending || (!accept.isSuccess && !accept.isError)) {
    return (
      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (accept.isError) {
    return (
      <div className="mt-8 space-y-4">
        <p className="text-sm text-danger-600" role="alert">
          {accept.error instanceof ApiError
            ? accept.error.message
            : "Unable to accept invitation"}
        </p>
        <Link href="/app">
          <Button variant="outline">Go to app</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <p className="text-sm text-success-600" role="status">
        {accept.data?.message} Joined {accept.data?.workspace.name}.
      </p>
      <Link href={`/app/w/${accept.data?.workspace.slug}`}>
        <Button>Open workspace</Button>
      </Link>
    </div>
  );
}
