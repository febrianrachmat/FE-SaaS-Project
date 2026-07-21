"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { ApiError } from "@/shared/types/api";
import { useVerifyEmail } from "../hooks/use-auth";

export function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const verify = useVerifyEmail();

  useEffect(() => {
    if (token.length >= 20 && !verify.isPending && !verify.isSuccess && !verify.isError) {
      void verify.mutateAsync(token);
    }
    // intentionally run once when token is present
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <p className="mt-6 text-sm text-danger-600" role="alert">
        Missing verification token. Check your email link.
      </p>
    );
  }

  if (verify.isPending || (!verify.isSuccess && !verify.isError)) {
    return (
      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (verify.isError) {
    return (
      <div className="mt-8 space-y-4">
        <p className="text-sm text-danger-600" role="alert">
          {verify.error instanceof ApiError
            ? verify.error.message
            : "Verification failed"}
        </p>
        <Link href="/login">
          <Button variant="outline">Back to sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <p className="text-sm text-success-600" role="status">
        {verify.data?.message ?? "Email verified"}
      </p>
      <Link href="/login">
        <Button>Continue to sign in</Button>
      </Link>
    </div>
  );
}
