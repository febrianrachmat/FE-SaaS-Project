import Link from "next/link";
import { ResetPasswordForm } from "@/features/auth";
import { APP_NAME } from "@/config/env";

export const metadata = {
  title: "Set new password",
};

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50/30 px-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-bold text-primary-600"
        >
          {APP_NAME}
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
          Set new password
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Choose a strong password for your account.
        </p>
        {token.length >= 20 ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="mt-8 text-sm text-danger-600" role="alert">
            Invalid or missing reset token.
          </p>
        )}
      </div>
    </div>
  );
}
