"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Bell } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useNotifications, useUnreadCount, collabKeys } from "../hooks/use-collab";
import { collabApi, type NotificationItem } from "../api/collab.api";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/features/workspace";
import { cn } from "@/shared/lib/utils";

function notificationHref(
  n: NotificationItem,
  activeSlug: string | null,
): string | null {
  const data =
    n.data && typeof n.data === "object" && !Array.isArray(n.data)
      ? (n.data as Record<string, unknown>)
      : null;
  const projectSlug =
    typeof data?.projectSlug === "string" ? data.projectSlug : null;
  const taskId = typeof data?.taskId === "string" ? data.taskId : null;
  const slug = activeSlug;

  if (slug && projectSlug && taskId) {
    return `/app/w/${slug}/projects/${projectSlug}?task=${taskId}`;
  }
  if (slug && projectSlug) {
    return `/app/w/${slug}/projects/${projectSlug}`;
  }
  if (slug) return `/app/w/${slug}`;
  return null;
}

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data: notifications } = useNotifications();
  const { data: unread } = useUnreadCount();
  const qc = useQueryClient();
  const router = useRouter();
  const activeSlug = useWorkspaceStore((s) => s.activeSlug);
  const count = unread?.count ?? 0;

  const visible = useMemo(() => {
    const list = notifications ?? [];
    if (!unreadOnly) return list;
    return list.filter((n) => !n.readAt);
  }, [notifications, unreadOnly]);

  const grouped = useMemo(() => {
    const map = new Map<string, NotificationItem[]>();
    for (const n of visible) {
      const data =
        n.data && typeof n.data === "object" && !Array.isArray(n.data)
          ? (n.data as Record<string, unknown>)
          : null;
      const projectSlug =
        typeof data?.projectSlug === "string" ? data.projectSlug : null;
      const key = projectSlug ?? n.type;
      const list = map.get(key) ?? [];
      list.push(n);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [visible]);

  async function openNotification(n: NotificationItem) {
    if (!n.readAt) {
      await collabApi.markRead(n.id);
      void qc.invalidateQueries({ queryKey: collabKeys.notifications });
      void qc.invalidateQueries({ queryKey: collabKeys.unread });
    }
    const href = notificationHref(n, activeSlug);
    setOpen(false);
    if (href) router.push(href);
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-4 w-4" />
        {count > 0 ? (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-600 px-1 text-[10px] text-white">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-96 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 dark:border-zinc-800">
            <p className="text-sm font-semibold">Notifications</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(
                  "text-xs hover:underline",
                  unreadOnly ? "text-primary-600" : "text-slate-400",
                )}
                onClick={() => setUnreadOnly((v) => !v)}
              >
                {unreadOnly ? "Show all" : "Unread"}
              </button>
              <button
                type="button"
                className="text-xs text-primary-600 hover:underline"
                onClick={async () => {
                  await collabApi.markAllRead();
                  void qc.invalidateQueries({
                    queryKey: collabKeys.notifications,
                  });
                  void qc.invalidateQueries({ queryKey: collabKeys.unread });
                }}
              >
                Mark all read
              </button>
            </div>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {visible.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-slate-400">
                {unreadOnly ? "No unread notifications." : "You're all caught up."}
              </li>
            ) : (
              grouped.map(([group, items]) => (
                <li key={group} className="border-b border-slate-50 last:border-0 dark:border-zinc-800">
                  <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                    {group.replaceAll("_", " ")}
                  </p>
                  <ul>
                    {items.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          className={cn(
                            "w-full px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800",
                            !n.readAt &&
                              "bg-primary-50/50 dark:bg-primary-950/20",
                          )}
                          onClick={() => void openNotification(n)}
                        >
                          <p className="text-sm font-medium">{n.title}</p>
                          {n.body ? (
                            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                              {n.body}
                            </p>
                          ) : null}
                          <p className="mt-1 text-[10px] text-slate-400">
                            {formatDistanceToNow(parseISO(n.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
