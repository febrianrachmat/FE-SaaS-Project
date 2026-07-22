import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/features/auth";
import { BrandLogo } from "@/shared/components/brand-logo";
import { Skeleton } from "@/shared/ui/skeleton";

export const metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50/30 px-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none">
        <BrandLogo height={28} />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
          Create account
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Start managing projects with FlowPilot.
        </p>
        <Suspense fallback={<Skeleton className="mt-8 h-64 w-full" />}>
          <RegisterForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
