"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { projectApi } from "../api/project.api";
import type { CreateProjectInput, CreateTaskInput } from "../schemas/project.schema";
import type { TaskPriority, TaskStatus } from "@/shared/types/domain";

export const projectKeys = {
  list: (ws: string) => ["projects", ws] as const,
  detail: (ws: string, ps: string) => ["projects", ws, ps] as const,
  tasks: (ws: string, ps: string, filters?: string) =>
    ["projects", ws, ps, "tasks", filters ?? ""] as const,
  task: (ws: string, ps: string, id: string) =>
    ["projects", ws, ps, "tasks", id] as const,
};

export function useProjects(workspaceSlug: string) {
  return useQuery({
    queryKey: projectKeys.list(workspaceSlug),
    queryFn: () => projectApi.list(workspaceSlug),
    enabled: !!workspaceSlug,
  });
}

export function useProject(workspaceSlug: string, projectSlug: string) {
  return useQuery({
    queryKey: projectKeys.detail(workspaceSlug, projectSlug),
    queryFn: () => projectApi.get(workspaceSlug, projectSlug),
    enabled: !!workspaceSlug && !!projectSlug,
  });
}

export function useCreateProject(workspaceSlug: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectInput) =>
      projectApi.create(workspaceSlug, payload),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.list(workspaceSlug),
      });
      router.push(`/app/w/${workspaceSlug}/projects/${project.slug}`);
    },
  });
}

export function useToggleFavorite(workspaceSlug: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => projectApi.toggleFavorite(workspaceSlug, projectSlug),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.list(workspaceSlug),
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(workspaceSlug, projectSlug),
      });
    },
  });
}

export function useTasks(
  workspaceSlug: string,
  projectSlug: string,
  filters?: { status?: TaskStatus; priority?: TaskPriority; q?: string },
) {
  const key = JSON.stringify(filters ?? {});
  return useQuery({
    queryKey: projectKeys.tasks(workspaceSlug, projectSlug, key),
    queryFn: () => projectApi.listTasks(workspaceSlug, projectSlug, filters),
    enabled: !!workspaceSlug && !!projectSlug,
  });
}

export function useCreateTask(workspaceSlug: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskInput) =>
      projectApi.createTask(workspaceSlug, projectSlug, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["projects", workspaceSlug, projectSlug, "tasks"],
      });
    },
  });
}

export function useUpdateTask(workspaceSlug: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      ...payload
    }: {
      taskId: string;
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string | null;
    }) => projectApi.updateTask(workspaceSlug, projectSlug, taskId, payload),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ["projects", workspaceSlug, projectSlug, "tasks"],
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.task(workspaceSlug, projectSlug, vars.taskId),
      });
    },
  });
}

export function useTask(
  workspaceSlug: string,
  projectSlug: string,
  taskId: string,
) {
  return useQuery({
    queryKey: projectKeys.task(workspaceSlug, projectSlug, taskId),
    queryFn: () => projectApi.getTask(workspaceSlug, projectSlug, taskId),
    enabled: !!workspaceSlug && !!projectSlug && !!taskId,
  });
}
