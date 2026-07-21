"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ApiError } from "@/shared/types/api";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "../schemas/auth.schema";
import { useResetPassword } from "../hooks/use-auth";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const reset = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await reset.mutateAsync(values);
    } catch {
      // surfaced below
    }
  });

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
      <input type="hidden" {...register("token")} />

      <div>
        <Label htmlFor="password">New password</Label>
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

      <div>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="mt-1 text-xs text-danger-600" role="alert">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      {reset.error instanceof ApiError ? (
        <p
          className="rounded-lg border border-danger-500/30 bg-danger-500/10 px-3 py-2 text-sm text-danger-600"
          role="alert"
        >
          {reset.error.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={reset.isPending}>
        {reset.isPending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
