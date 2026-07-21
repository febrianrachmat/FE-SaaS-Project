"use client";

import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  useRemoveMember,
  useWorkspaceMembers,
} from "../hooks/use-workspace";

type MembersListProps = {
  slug: string;
  canManage: boolean;
};

export function MembersList({ slug, canManage }: MembersListProps) {
  const { data, isLoading } = useWorkspaceMembers(slug);
  const remove = useRemoveMember(slug);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-zinc-800 dark:border-zinc-800">
      {data?.map((member) => (
        <li
          key={member.id}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-zinc-50">
              {member.user.name}
            </p>
            <p className="text-xs text-slate-500">{member.user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
              {member.role.replace("_", " ")}
            </span>
            {canManage && member.role !== "OWNER" ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={remove.isPending}
                onClick={() => remove.mutate(member.id)}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
