"use client";

import { useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Bell } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useNotifications, useUnreadCount, collabKeys } from "../hooks/use-collab";
import { collabApi } from "../api/collab.api";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/shared/lib/utils";

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const { data: unread } = useUnreadCount();
  const qc = useQueryClient();
  const count = unread?.count ?? 0;

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
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-zinc-800">
            <p className="text-sm font-semibold">Notifications</p>
            <button
              type="button"
              className="text-xs text-primary-600 hover:underline"
              onClick={async () => {
                await collabApi.markAllRead();
                void qc.invalidateQueries({ queryKey: collabKeys.notifications });
                void qc.invalidateQueries({ queryKey: collabKeys.unread });
              }}
            >
              Mark all read
            </button>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {(notifications ?? []).length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-slate-400">
                You&apos;re all caught up.
              </li>
            ) : (
              (notifications ?? []).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800",
                      !n.readAt && "bg-primary-50/50 dark:bg-primary-950/20",
                    )}
                    onClick={async () => {
                      if (!n.readAt) {
                        await collabApi.markRead(n.id);
                        void qc.invalidateQueries({
                          queryKey: collabKeys.notifications,
                        });
                        void qc.invalidateQueries({
                          queryKey: collabKeys.unread,
                        });
                      }
                    }}
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
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
