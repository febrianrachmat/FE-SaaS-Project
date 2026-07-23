"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cycleApi } from "../api/cycle.api";
import type { CreateCycleInput, UpdateCycleInput } from "../types";

export const cycleKeys = {
  list: (slug: string) => ["cycles", slug] as const,
  board: (slug: string, cycleId: string) =>
    ["cycles", slug, cycleId, "board"] as const,
  candidates: (slug: string, cycleId: string, q: string) =>
    ["cycles", slug, cycleId, "candidates", q] as const,
};

export function useCycles(workspaceSlug: string) {
  return useQuery({
    queryKey: cycleKeys.list(workspaceSlug),
    queryFn: () => cycleApi.list(workspaceSlug),
    enabled: !!workspaceSlug,
  });
}

export function useCycleBoard(workspaceSlug: string, cycleId: string) {
  return useQuery({
    queryKey: cycleKeys.board(workspaceSlug, cycleId),
    queryFn: () => cycleApi.getBoard(workspaceSlug, cycleId),
    enabled: !!workspaceSlug && !!cycleId,
  });
}

export function useCycleCandidates(
  workspaceSlug: string,
  cycleId: string,
  q = "",
) {
  return useQuery({
    queryKey: cycleKeys.candidates(workspaceSlug, cycleId, q),
    queryFn: () => cycleApi.listCandidates(workspaceSlug, cycleId, q),
    enabled: !!workspaceSlug && !!cycleId,
  });
}

export function useAddCycleTask(workspaceSlug: string, cycleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) =>
      cycleApi.addTask(workspaceSlug, cycleId, taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.board(workspaceSlug, cycleId),
      });
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.list(workspaceSlug),
      });
      void queryClient.invalidateQueries({
        queryKey: ["cycles", workspaceSlug, cycleId, "candidates"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["projects", workspaceSlug],
      });
    },
  });
}

export function useRemoveCycleTask(workspaceSlug: string, cycleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) =>
      cycleApi.removeTask(workspaceSlug, cycleId, taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.board(workspaceSlug, cycleId),
      });
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.list(workspaceSlug),
      });
      void queryClient.invalidateQueries({
        queryKey: ["cycles", workspaceSlug, cycleId, "candidates"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["projects", workspaceSlug],
      });
    },
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
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.list(workspaceSlug),
      });
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.board(workspaceSlug, vars.cycleId),
      });
    },
  });
}

export function useActivateCycle(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cycleId: string) =>
      cycleApi.activate(workspaceSlug, cycleId),
    onSuccess: (_data, cycleId) => {
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.list(workspaceSlug),
      });
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.board(workspaceSlug, cycleId),
      });
    },
  });
}

export function useCompleteCycle(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cycleId: string) =>
      cycleApi.complete(workspaceSlug, cycleId),
    onSuccess: (_data, cycleId) => {
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.list(workspaceSlug),
      });
      void queryClient.invalidateQueries({
        queryKey: cycleKeys.board(workspaceSlug, cycleId),
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
