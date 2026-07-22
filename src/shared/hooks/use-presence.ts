"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth";
import {
  useRealtimeSocket,
  type PresenceUser,
} from "@/shared/providers/realtime-provider";

/**
 * Emits presence:join while mounted and returns online users (deduped by userId).
 * When `projectSlug` is provided, returns users currently viewing that project.
 */
export function usePresence(
  workspaceSlug: string,
  projectSlug?: string,
): PresenceUser[] {
  const user = useAuthStore((s) => s.user);
  const socket = useRealtimeSocket();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!workspaceSlug || !user || !socket) {
      setOnlineUsers([]);
      return;
    }

    const onUpdate = (users: PresenceUser[]) => {
      if (projectSlug) {
        setOnlineUsers(users.filter((u) => u.projectSlug === projectSlug));
      } else {
        setOnlineUsers(users);
      }
    };

    socket.on("presence:update", onUpdate);
    socket.emit("presence:join", { workspaceSlug, projectSlug });

    return () => {
      socket.emit("presence:leave");
      socket.off("presence:update", onUpdate);
    };
  }, [socket, workspaceSlug, projectSlug, user]);

  return onlineUsers;
}
