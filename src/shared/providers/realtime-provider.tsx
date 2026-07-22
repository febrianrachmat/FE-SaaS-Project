"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/config/env";
import { useAuthStore } from "@/features/auth";
import { useWorkspaceStore } from "@/features/workspace";
import { collabKeys } from "@/features/collab/hooks/use-collab";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard";

export type PresenceUser = {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  projectSlug?: string;
};

function realtimeOrigin(): string {
  try {
    const url = new URL(API_URL);
    return url.origin;
  } catch {
    return API_URL.replace(/\/v1\/?$/, "");
  }
}

let socketSingleton: Socket | null = null;

export function getRealtimeSocket(): Socket | null {
  return socketSingleton;
}

const RealtimeSocketContext = createContext<Socket | null>(null);

export function useRealtimeSocket(): Socket | null {
  return useContext(RealtimeSocketContext);
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const activeSlug = useWorkspaceStore((s) => s.activeSlug);
  const [socket, setSocket] = useState<Socket | null>(socketSingleton);

  useEffect(() => {
    if (!user) {
      socketSingleton?.disconnect();
      socketSingleton = null;
      setSocket(null);
      return;
    }

    if (!socketSingleton) {
      socketSingleton = io(`${realtimeOrigin()}/realtime`, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      socketSingleton.on("task:changed", (payload: {
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
        void queryClient.invalidateQueries({
          queryKey: ["activity", payload.workspaceSlug],
        });
        void queryClient.invalidateQueries({
          queryKey: dashboardKeys.overview(payload.workspaceSlug),
        });
      });

      socketSingleton.on("notification:new", () => {
        void queryClient.invalidateQueries({ queryKey: collabKeys.notifications });
        void queryClient.invalidateQueries({ queryKey: collabKeys.unread });
      });
    }

    setSocket(socketSingleton);

    return () => {
      // keep socket across slug changes; disconnect only on logout (user null)
    };
  }, [user, queryClient]);

  useEffect(() => {
    if (!socket || !activeSlug || !user) return;
    socket.emit("workspace:join", { slug: activeSlug });
    return () => {
      socket.emit("workspace:leave", { slug: activeSlug });
    };
  }, [socket, activeSlug, user]);

  return (
    <RealtimeSocketContext.Provider value={socket}>
      {children}
    </RealtimeSocketContext.Provider>
  );
}
