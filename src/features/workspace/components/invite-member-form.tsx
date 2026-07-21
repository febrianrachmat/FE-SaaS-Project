"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ApiError } from "@/shared/types/api";
import {
  inviteMemberSchema,
  type InviteMemberInput,
} from "../schemas/workspace.schema";
import { useInviteMember } from "../hooks/use-workspace";

type InviteMemberFormProps = {
  slug: string;
};

export function InviteMemberForm({ slug }: InviteMemberFormProps) {
  const invite = useInviteMember(slug);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", role: "MEMBER" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await invite.mutateAsync(values);
      reset({ email: "", role: "MEMBER" });
    } catch {
      // shown below
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      noValidate
    >
      <div className="flex-1">
        <Label htmlFor="invite-email">Invite by email</Label>
        <Input
          id="invite-email"
          type="email"
          placeholder="teammate@company.com"
          {...register("email")}
        />
        {errors.email ? (
          <p className="mt-1 text-xs text-danger-600">{errors.email.message}</p>
        ) : null}
      </div>
      <div className="sm:w-44">
        <Label htmlFor="invite-role">Role</Label>
        <select
          id="invite-role"
          className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          {...register("role")}
        >
          <option value="GUEST">Guest</option>
          <option value="MEMBER">Member</option>
          <option value="PROJECT_MANAGER">Project Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <Button type="submit" disabled={invite.isPending}>
        {invite.isPending ? "Sending…" : "Invite"}
      </Button>
      {invite.isSuccess ? (
        <p className="text-sm text-success-600 sm:basis-full" role="status">
          Invitation sent to {invite.data.email}
        </p>
      ) : null}
      {invite.error instanceof ApiError ? (
        <p className="text-sm text-danger-600 sm:basis-full" role="alert">
          {invite.error.message}
        </p>
      ) : null}
    </form>
  );
}
