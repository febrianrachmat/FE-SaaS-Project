"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { collabApi } from "../api/collab.api";

export const collabKeys = {
  comments: (ws: string, ps: string, taskId: string) =>
    ["comments", ws, ps, taskId] as const,
  attachments: (ws: string, ps: string, taskId: string) =>
    ["attachments", ws, ps, taskId] as const,
  notifications: ["notifications"] as const,
  unread: ["notifications", "unread"] as const,
  search: (ws: string, q: string) => ["search", ws, q] as const,
};

export function useComments(ws: string, ps: string, taskId: string) {
  return useQuery({
    queryKey: collabKeys.comments(ws, ps, taskId),
    queryFn: () => collabApi.listComments(ws, ps, taskId),
    enabled: !!ws && !!ps && !!taskId,
  });
}

export function useCreateComment(ws: string, ps: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => collabApi.createComment(ws, ps, taskId, body),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: collabKeys.comments(ws, ps, taskId),
      });
    },
  });
}

export function useAttachments(ws: string, ps: string, taskId: string) {
  return useQuery({
    queryKey: collabKeys.attachments(ws, ps, taskId),
    queryFn: () => collabApi.listAttachments(ws, ps, taskId),
    enabled: !!ws && !!ps && !!taskId,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: collabKeys.notifications,
    queryFn: () => collabApi.notifications(),
    refetchInterval: 30_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: collabKeys.unread,
    queryFn: () => collabApi.unreadCount(),
    refetchInterval: 30_000,
  });
}
