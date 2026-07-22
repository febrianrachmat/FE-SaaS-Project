"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ApiError } from "@/shared/types/api";
import { registerSchema, type RegisterInput } from "../schemas/auth.schema";
import { useRegister } from "../hooks/use-auth";
import { GoogleAuthButton } from "./google-auth-button";

export function RegisterForm() {
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync(values);
    } catch {
      // surfaced below
    }
  });

  const errorMessage =
    registerMutation.error instanceof ApiError
      ? registerMutation.error.message
      : registerMutation.error
        ? "Unable to create account"
        : null;

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
      <GoogleAuthButton label="Sign up with Google" />

      <div className="relative py-1 text-center text-xs text-slate-400">
        <span className="relative z-10 bg-white px-2 dark:bg-zinc-950">
          or continue with email
        </span>
        <span className="absolute inset-x-0 top-1/2 border-t border-slate-200 dark:border-zinc-800" />
      </div>

      <div>
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name ? (
          <p className="mt-1 text-xs text-danger-600" role="alert">
            {errors.name.message}
          </p>
        ) : null}
      </div>

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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password ? (
          <p className="mt-1 text-xs text-danger-600" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {errorMessage ? (
        <p
          className="rounded-lg border border-danger-500/30 bg-danger-500/10 px-3 py-2 text-sm text-danger-600"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
