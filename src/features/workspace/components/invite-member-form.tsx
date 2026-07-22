"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
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
      setCopied(false);
      await invite.mutateAsync(values);
      reset({ email: "", role: "MEMBER" });
    } catch {
      // shown below
    }
  });

  return (
    <div className="space-y-3">
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
            <p className="mt-1 text-xs text-danger-600">
              {errors.email.message}
            </p>
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
      </form>

      {invite.isSuccess && invite.data ? (
        <div
          className="rounded-xl border border-success-500/30 bg-success-500/10 p-3 text-sm"
          role="status"
        >
          <p className="text-success-700 dark:text-success-400">
            {invite.data.message} ({invite.data.email})
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="flex-1 truncate rounded-lg bg-white/70 px-2 py-1.5 text-xs text-slate-600 dark:bg-zinc-900 dark:text-zinc-300">
              {invite.data.inviteLink}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(invite.data.inviteLink);
                setCopied(true);
              }}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy link
                </>
              )}
            </Button>
          </div>
        </div>
      ) : null}

      {invite.error instanceof ApiError ? (
        <p className="text-sm text-danger-600" role="alert">
          {invite.error.message}
        </p>
      ) : null}
    </div>
  );
}
