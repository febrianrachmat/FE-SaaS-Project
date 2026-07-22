"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cycleApi } from "../api/cycle.api";
import type { CreateCycleInput, UpdateCycleInput } from "../types";

export const cycleKeys = {
  list: (slug: string) => ["cycles", slug] as const,
};

export function useCycles(workspaceSlug: string) {
  return useQuery({
    queryKey: cycleKeys.list(workspaceSlug),
    queryFn: () => cycleApi.list(workspaceSlug),
    enabled: !!workspaceSlug,
  });
}

export function useCreateCycle(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCycleInput) =>
      cycleApi.create(workspaceSlug, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.list(workspaceSlug),
      });
    },
  });
}

export function useUpdateCycle(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cycleId,
      ...payload
    }: UpdateCycleInput & { cycleId: string }) =>
      cycleApi.update(workspaceSlug, cycleId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.list(workspaceSlug),
      });
    },
  });
}

export function useActivateCycle(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cycleId: string) =>
      cycleApi.activate(workspaceSlug, cycleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.list(workspaceSlug),
      });
    },
  });
}

export function useCompleteCycle(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cycleId: string) =>
      cycleApi.complete(workspaceSlug, cycleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.list(workspaceSlug),
      });
    },
  });
}

export function useDeleteCycle(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cycleId: string) => cycleApi.remove(workspaceSlug, cycleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.list(workspaceSlug),
      });
      void queryClient.invalidateQueries({
        queryKey: ["projects", workspaceSlug],
      });
    },
  });
}
