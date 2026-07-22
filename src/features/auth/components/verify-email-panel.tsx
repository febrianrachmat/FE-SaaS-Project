"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { UseMutationResult } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { ApiError } from "@/shared/types/api";
import type { AuthMessageResult } from "../api/auth.api";
import { useResendVerification, useVerifyEmail } from "../hooks/use-auth";

export function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const verify = useVerifyEmail();
  const resend = useResendVerification();
  const [email, setEmail] = useState("");
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (
      token.length >= 20 &&
      !verify.isPending &&
      !verify.isSuccess &&
      !verify.isError
    ) {
      void verify.mutateAsync(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <div className="mt-6 space-y-4">
        <p className="text-sm text-danger-600" role="alert">
          Missing verification token. Check your email link, or request a new
          one below.
        </p>
        <ResendBlock
          email={email}
          setEmail={setEmail}
          resent={resent}
          setResent={setResent}
          resend={resend}
        />
      </div>
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
        <ResendBlock
          email={email}
          setEmail={setEmail}
          resent={resent}
          setResent={setResent}
          resend={resend}
        />
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

function ResendBlock({
  email,
  setEmail,
  resent,
  setResent,
  resend,
}: {
  email: string;
  setEmail: (v: string) => void;
  resent: boolean;
  setResent: (v: boolean) => void;
  resend: UseMutationResult<AuthMessageResult, Error, string, unknown>;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-zinc-800">
      <p className="text-sm text-slate-600 dark:text-zinc-400">
        Need a new verification link?
      </p>
      <div>
        <Label htmlFor="resend-email">Email</Label>
        <Input
          id="resend-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      {resent ? (
        <p className="text-sm text-success-600" role="status">
          {resend.data?.message ?? "If eligible, a new link was sent."}
        </p>
      ) : null}
      {resend.isError ? (
        <p className="text-sm text-danger-600" role="alert">
          {resend.error instanceof ApiError
            ? resend.error.message
            : "Could not resend verification email"}
        </p>
      ) : null}
      <Button
        type="button"
        variant="outline"
        disabled={resend.isPending || email.trim().length < 3}
        onClick={async () => {
          try {
            await resend.mutateAsync(email.trim());
            setResent(true);
          } catch {
            // shown via resend.error
          }
        }}
      >
        {resend.isPending ? "Sending…" : "Resend verification email"}
      </Button>
    </div>
  );
}
