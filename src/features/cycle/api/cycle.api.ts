import { apiClient } from "@/shared/lib/api-client";
import type {
  CreateCycleInput,
  Cycle,
  CycleBoard,
  CycleBoardTask,
  UpdateCycleInput,
} from "../types";

export const cycleApi = {
  list: (workspaceSlug: string) =>
    apiClient<Cycle[]>(`/workspaces/${workspaceSlug}/cycles`),

  getBoard: (workspaceSlug: string, cycleId: string) =>
    apiClient<CycleBoard>(
      `/workspaces/${workspaceSlug}/cycles/${cycleId}/board`,
    ),

  listCandidates: (workspaceSlug: string, cycleId: string, q?: string) => {
    const qs = q?.trim()
      ? `?q=${encodeURIComponent(q.trim())}`
      : "";
    return apiClient<CycleBoardTask[]>(
      `/workspaces/${workspaceSlug}/cycles/${cycleId}/candidates${qs}`,
    );
  },

  addTask: (workspaceSlug: string, cycleId: string, taskId: string) =>
    apiClient<CycleBoard>(
      `/workspaces/${workspaceSlug}/cycles/${cycleId}/tasks`,
      { method: "POST", body: { taskId } },
    ),

  removeTask: (workspaceSlug: string, cycleId: string, taskId: string) =>
    apiClient<CycleBoard>(
      `/workspaces/${workspaceSlug}/cycles/${cycleId}/tasks/${taskId}`,
      { method: "DELETE" },
    ),

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
