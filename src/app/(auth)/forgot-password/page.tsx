import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth";
import { BrandLogo } from "@/shared/components/brand-logo";

export const metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50/30 px-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none">
        <BrandLogo height={28} />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your email and we&apos;ll send a reset link.
        </p>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="text-primary-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
