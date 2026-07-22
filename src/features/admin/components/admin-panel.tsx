"use client";

import { useAuthStore } from "@/features/auth";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  useAdminStats,
  useAdminUsers,
  useUpdateSystemRole,
} from "../hooks/use-admin";

export function AdminPanel() {
  const currentUser = useAuthStore((s) => s.user);
  const stats = useAdminStats();
  const users = useAdminUsers();
  const updateRole = useUpdateSystemRole();

  if (currentUser?.systemRole !== "SYSTEM_ADMIN") {
    return (
      <p className="text-sm text-slate-500">
        System admin access is required to view this page.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          System admin
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Platform overview and user roles
        </p>
      </div>

      {stats.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : stats.data ? (
        <div className="grid gap-3 sm:grid-cols-4">
          {(
            [
              ["Users", stats.data.users],
              ["Workspaces", stats.data.workspaces],
              ["Projects", stats.data.projects],
              ["Tasks", stats.data.tasks],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-zinc-300">
          Users
        </h2>
        {users.isLoading ? <Skeleton className="h-40 w-full" /> : null}
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-zinc-800 dark:border-zinc-800">
          {users.data?.map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-xs text-slate-500">
                  {u.email} · {u.workspaceCount} workspaces
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium dark:bg-zinc-800">
                  {u.systemRole}
                </span>
                {u.id !== currentUser.id ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={updateRole.isPending}
                    onClick={() =>
                      updateRole.mutate({
                        userId: u.id,
                        systemRole:
                          u.systemRole === "SYSTEM_ADMIN"
                            ? "USER"
                            : "SYSTEM_ADMIN",
                      })
                    }
                  >
                    {u.systemRole === "SYSTEM_ADMIN"
                      ? "Demote"
                      : "Make admin"}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
