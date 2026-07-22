"use client";

import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/config/env";
import { useAuthStore } from "@/features/auth";
import { useWorkspaceStore } from "@/features/workspace";
import { collabKeys } from "@/features/collab/hooks/use-collab";

function realtimeOrigin(): string {
  try {
    const url = new URL(API_URL);
    return url.origin;
  } catch {
    return API_URL.replace(/\/v1\/?$/, "");
  }
}

let socket: Socket | null = null;

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const activeSlug = useWorkspaceStore((s) => s.activeSlug);

  useEffect(() => {
    if (!user) {
      socket?.disconnect();
      socket = null;
      return;
    }

    if (!socket) {
      socket = io(`${realtimeOrigin()}/realtime`, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      socket.on("task:changed", (payload: {
        workspaceSlug: string;
        projectSlug: string;
        taskId: string;
      }) => {
        void queryClient.invalidateQueries({
          queryKey: [
            "projects",
            payload.workspaceSlug,
            payload.projectSlug,
            "tasks",
          ],
        });
        void queryClient.invalidateQueries({
          queryKey: collabKeys.comments(
            payload.workspaceSlug,
            payload.projectSlug,
            payload.taskId,
          ),
        });
      });

      socket.on("notification:new", () => {
        void queryClient.invalidateQueries({ queryKey: collabKeys.notifications });
        void queryClient.invalidateQueries({ queryKey: collabKeys.unread });
      });
    }

    return () => {
      // keep socket across slug changes; disconnect only on logout (user null)
    };
  }, [user, queryClient]);

  useEffect(() => {
    if (!socket || !activeSlug || !user) return;
    socket.emit("workspace:join", { slug: activeSlug });
    return () => {
      socket?.emit("workspace:leave", { slug: activeSlug });
    };
  }, [activeSlug, user]);

  return children;
}
