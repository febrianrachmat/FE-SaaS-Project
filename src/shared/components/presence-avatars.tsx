"use client";

import { cn } from "@/shared/lib/utils";
import type { PresenceUser } from "@/shared/providers/realtime-provider";

type Props = {
  users: PresenceUser[];
  /** Max overlapping avatars before "+N" */
  maxVisible?: number;
  className?: string;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function PresenceAvatars({
  users,
  maxVisible = 4,
  className,
}: Props) {
  if (users.length === 0) return null;

  const visible = users.slice(0, maxVisible);
  const overflow = users.length - visible.length;

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      title={users.map((u) => u.name).join(", ")}
      aria-label={`${users.length} online`}
    >
      <div className="flex -space-x-2">
        {visible.map((u) => (
          <span
            key={u.userId}
            className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-[10px] font-medium text-primary-700 ring-2 ring-white dark:bg-primary-900 dark:text-primary-200 dark:ring-zinc-950"
            title={u.name}
          >
            {u.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={u.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              initials(u.name)
            )}
          </span>
        ))}
        {overflow > 0 ? (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-medium text-slate-700 ring-2 ring-white dark:bg-zinc-700 dark:text-zinc-100 dark:ring-zinc-950">
            +{overflow}
          </span>
        ) : null}
      </div>
      <span className="text-xs text-slate-500">
        {users.length} online
      </span>
    </div>
  );
}
