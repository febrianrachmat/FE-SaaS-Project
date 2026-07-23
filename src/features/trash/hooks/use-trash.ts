"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trashApi } from "../api/trash.api";

export const trashKeys = {
  list: (slug: string) => ["trash", slug] as const,
};

export function useTrash(workspaceSlug: string, enabled = true) {
  return useQuery({
    queryKey: trashKeys.list(workspaceSlug),
    queryFn: () => trashApi.list(workspaceSlug),
    enabled: !!workspaceSlug && enabled,
  });
}

export function useRestoreProject(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectSlug: string) =>
      trashApi.restoreProject(workspaceSlug, projectSlug),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: trashKeys.list(workspaceSlug),
      });
      void queryClient.invalidateQueries({ queryKey: ["projects", workspaceSlug] });
    },
  });
}

export function useRestoreTask(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectSlug,
      taskId,
    }: {
      projectSlug: string;
      taskId: string;
    }) => trashApi.restoreTask(workspaceSlug, projectSlug, taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: trashKeys.list(workspaceSlug),
      });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
