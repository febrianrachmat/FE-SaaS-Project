"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ApiError } from "@/shared/types/api";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "../schemas/auth.schema";
import { useForgotPassword } from "../hooks/use-auth";

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await forgot.mutateAsync(values);
    } catch {
      // surfaced below
    }
  });

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
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

      {forgot.isSuccess ? (
        <p
          className="rounded-lg border border-success-500/30 bg-success-500/10 px-3 py-2 text-sm text-success-600"
          role="status"
        >
          {forgot.data.message}
        </p>
      ) : null}

      {forgot.error instanceof ApiError ? (
        <p
          className="rounded-lg border border-danger-500/30 bg-danger-500/10 px-3 py-2 text-sm text-danger-600"
          role="alert"
        >
          {forgot.error.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={forgot.isPending}>
        {forgot.isPending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
