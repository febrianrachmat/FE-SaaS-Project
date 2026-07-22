import { apiClient } from "@/shared/lib/api-client";
import type { CreateCycleInput, Cycle, UpdateCycleInput } from "../types";

export const cycleApi = {
  list: (workspaceSlug: string) =>
    apiClient<Cycle[]>(`/workspaces/${workspaceSlug}/cycles`),

  create: (workspaceSlug: string, payload: CreateCycleInput) =>
    apiClient<Cycle>(`/workspaces/${workspaceSlug}/cycles`, {
      method: "POST",
      body: payload,
    }),

  update: (
    workspaceSlug: string,
    cycleId: string,
    payload: UpdateCycleInput,
  ) =>
    apiClient<Cycle>(`/workspaces/${workspaceSlug}/cycles/${cycleId}`, {
      method: "PATCH",
      body: payload,
    }),

  activate: (workspaceSlug: string, cycleId: string) =>
    apiClient<Cycle>(
      `/workspaces/${workspaceSlug}/cycles/${cycleId}/activate`,
      { method: "POST" },
    ),

  complete: (workspaceSlug: string, cycleId: string) =>
    apiClient<Cycle>(
      `/workspaces/${workspaceSlug}/cycles/${cycleId}/complete`,
      { method: "POST" },
    ),

  remove: (workspaceSlug: string, cycleId: string) =>
    apiClient<{ message: string }>(
      `/workspaces/${workspaceSlug}/cycles/${cycleId}`,
      { method: "DELETE" },
    ),
};
