"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ApiError } from "@/shared/types/api";
import { loginSchema, type LoginInput } from "../schemas/auth.schema";
import { useLogin } from "../hooks/use-auth";

export function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const reset = searchParams.get("reset") === "1";
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
    } catch {
      // error rendered below via login.error
    }
  });

  const errorMessage =
    login.error instanceof ApiError
      ? login.error.message
      : login.error
        ? "Unable to sign in"
        : null;

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
      {registered ? (
        <p
          className="rounded-lg border border-success-500/30 bg-success-500/10 px-3 py-2 text-sm text-success-600"
          role="status"
        >
          Account created. Check your email to verify, then sign in.
        </p>
      ) : null}
      {reset ? (
        <p
          className="rounded-lg border border-success-500/30 bg-success-500/10 px-3 py-2 text-sm text-success-600"
          role="status"
        >
          Password updated. Sign in with your new password.
        </p>
      ) : null}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email ? (
          <p className="mt-1 text-xs text-danger-600" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="password" className="mb-0">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs text-primary-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password ? (
          <p className="mt-1 text-xs text-danger-600" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          {...register("rememberMe")}
        />
        Remember me for 30 days
      </label>

      {errorMessage ? (
        <p
          className="rounded-lg border border-danger-500/30 bg-danger-500/10 px-3 py-2 text-sm text-danger-600"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
