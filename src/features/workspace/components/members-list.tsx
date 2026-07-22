"use client";

import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  useRemoveMember,
  useUpdateMemberRole,
  useWorkspace,
  useWorkspaceMembers,
} from "../hooks/use-workspace";
import type { WorkspaceRole } from "@/shared/types/domain";

type MembersListProps = {
  slug: string;
  canManage: boolean;
};

const ASSIGNABLE_ROLES: Array<Exclude<WorkspaceRole, "OWNER">> = [
  "GUEST",
  "MEMBER",
  "PROJECT_MANAGER",
  "ADMIN",
];

export function MembersList({ slug, canManage }: MembersListProps) {
  const { data, isLoading } = useWorkspaceMembers(slug);
  const { data: workspace } = useWorkspace(slug);
  const remove = useRemoveMember(slug);
  const updateRole = useUpdateMemberRole(slug);

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
      {data?.map((member) => {
        const canChangeRole =
          canManage &&
          member.role !== "OWNER" &&
          member.userId !== workspace?.ownerId;

        return (
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
              {canChangeRole ? (
                <select
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-900"
                  value={member.role}
                  disabled={updateRole.isPending}
                  onChange={(e) =>
                    updateRole.mutate({
                      memberId: member.id,
                      role: e.target.value as
                        | "GUEST"
                        | "MEMBER"
                        | "PROJECT_MANAGER"
                        | "ADMIN",
                    })
                  }
                  aria-label={`Role for ${member.user.name}`}
                >
                  {ASSIGNABLE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role.replace("_", " ")}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {member.role.replace("_", " ")}
                </span>
              )}
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
        );
      })}
    </ul>
  );
}
