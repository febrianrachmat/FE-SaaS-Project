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
  subtasks: (ws: string, ps: string, id: string) =>
    ["projects", ws, ps, "tasks", id, "subtasks"] as const,
  labels: (ws: string) => ["labels", ws] as const,
  members: (ws: string, ps: string) =>
    ["projects", ws, ps, "members"] as const,
  dependencies: (ws: string, ps: string, taskId: string) =>
    ["projects", ws, ps, "tasks", taskId, "dependencies"] as const,
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

export function useCreateSampleProject(workspaceSlug: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => projectApi.createSample(workspaceSlug),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.list(workspaceSlug),
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.labels(workspaceSlug),
      });
      void queryClient.invalidateQueries({
        queryKey: ["dashboard", workspaceSlug],
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
  filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    q?: string;
    assigneeId?: string;
    labelId?: string;
    cycleId?: string;
  },
) {
  const key = JSON.stringify(filters ?? {});
  return useQuery({
    queryKey: projectKeys.tasks(workspaceSlug, projectSlug, key),
    queryFn: () => projectApi.listTasks(workspaceSlug, projectSlug, filters),
    enabled: !!workspaceSlug && !!projectSlug,
  });
}

export function usePaginatedTasks(
  workspaceSlug: string,
  projectSlug: string,
  filters: {
    status?: TaskStatus;
    priority?: TaskPriority;
    q?: string;
    assigneeId?: string;
    labelId?: string;
    cycleId?: string;
    page: number;
    limit?: number;
  },
) {
  const key = JSON.stringify(filters);
  return useQuery({
    queryKey: projectKeys.tasks(workspaceSlug, projectSlug, `page:${key}`),
    queryFn: () =>
      projectApi.listTasksPage(workspaceSlug, projectSlug, filters),
    enabled: !!workspaceSlug && !!projectSlug,
  });
}

export function useCreateTask(workspaceSlug: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskInput) =>
      projectApi.createTask(workspaceSlug, projectSlug, payload),
    onSuccess: (task) => {
      void queryClient.invalidateQueries({
        queryKey: ["projects", workspaceSlug, projectSlug, "tasks"],
      });
      if (task.parentId) {
        void queryClient.invalidateQueries({
          queryKey: projectKeys.subtasks(
            workspaceSlug,
            projectSlug,
            task.parentId,
          ),
        });
        void queryClient.invalidateQueries({
          queryKey: projectKeys.task(
            workspaceSlug,
            projectSlug,
            task.parentId,
          ),
        });
      }
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
      assigneeId?: string | null;
      cycleId?: string | null;
      labelIds?: string[];
      storyPoints?: number | null;
      estimatedMins?: number | null;
      actualMins?: number | null;
    }) => projectApi.updateTask(workspaceSlug, projectSlug, taskId, payload),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ["projects", workspaceSlug, projectSlug, "tasks"],
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.task(workspaceSlug, projectSlug, vars.taskId),
      });
      void queryClient.invalidateQueries({
        queryKey: ["projects", workspaceSlug, projectSlug, "tasks"],
        exact: false,
      });
    },
  });
}

export function useDeleteTask(workspaceSlug: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) =>
      projectApi.deleteTask(workspaceSlug, projectSlug, taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["projects", workspaceSlug, projectSlug, "tasks"],
      });
    },
  });
}

export function useBulkTasks(workspaceSlug: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload:
        | {
            action: "update";
            taskIds: string[];
            patch: {
              status?: TaskStatus;
              priority?: TaskPriority;
              assigneeId?: string | null;
            };
          }
        | { action: "delete"; taskIds: string[] },
    ) => projectApi.bulkTasks(workspaceSlug, projectSlug, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["projects", workspaceSlug, projectSlug, "tasks"],
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

export function useSubtasks(
  workspaceSlug: string,
  projectSlug: string,
  taskId: string,
) {
  return useQuery({
    queryKey: projectKeys.subtasks(workspaceSlug, projectSlug, taskId),
    queryFn: () => projectApi.listSubtasks(workspaceSlug, projectSlug, taskId),
    enabled: !!workspaceSlug && !!projectSlug && !!taskId,
  });
}

export function useTaskDependencies(
  workspaceSlug: string,
  projectSlug: string,
  taskId: string,
) {
  return useQuery({
    queryKey: projectKeys.dependencies(workspaceSlug, projectSlug, taskId),
    queryFn: () =>
      projectApi.listDependencies(workspaceSlug, projectSlug, taskId),
    enabled: !!workspaceSlug && !!projectSlug && !!taskId,
  });
}

export function useAddDependency(
  workspaceSlug: string,
  projectSlug: string,
  taskId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      toTaskId: string;
      type: "BLOCKS" | "IS_BLOCKED_BY" | "RELATES_TO";
    }) => projectApi.addDependency(workspaceSlug, projectSlug, taskId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.dependencies(workspaceSlug, projectSlug, taskId),
      });
    },
  });
}

export function useRemoveDependency(
  workspaceSlug: string,
  projectSlug: string,
  taskId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dependencyId: string) =>
      projectApi.removeDependency(workspaceSlug, dependencyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.dependencies(workspaceSlug, projectSlug, taskId),
      });
    },
  });
}

export function useLabels(workspaceSlug: string) {
  return useQuery({
    queryKey: projectKeys.labels(workspaceSlug),
    queryFn: () => projectApi.listLabels(workspaceSlug),
    enabled: !!workspaceSlug,
  });
}

export function useCreateLabel(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; color?: string }) =>
      projectApi.createLabel(workspaceSlug, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.labels(workspaceSlug),
      });
    },
  });
}

export function useUpdateLabel(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      labelId,
      ...payload
    }: {
      labelId: string;
      name?: string;
      color?: string;
    }) => projectApi.updateLabel(workspaceSlug, labelId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.labels(workspaceSlug),
      });
      void queryClient.invalidateQueries({
        queryKey: ["projects", workspaceSlug],
      });
    },
  });
}

export function useDeleteLabel(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) =>
      projectApi.deleteLabel(workspaceSlug, labelId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.labels(workspaceSlug),
      });
      void queryClient.invalidateQueries({
        queryKey: ["projects", workspaceSlug],
      });
    },
  });
}

export function useUpdateProject(workspaceSlug: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: Partial<{
        visibility: "PRIVATE" | "WORKSPACE";
        name: string;
        description: string | null;
        icon: string | null;
        coverUrl: string | null;
        status: string;
        priority: string;
        deadline: string | null;
      }>,
    ) => projectApi.update(workspaceSlug, projectSlug, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(workspaceSlug, projectSlug),
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.list(workspaceSlug),
      });
    },
  });
}

export function useArchiveProject(workspaceSlug: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => projectApi.archive(workspaceSlug, projectSlug),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(workspaceSlug, projectSlug),
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.list(workspaceSlug),
      });
    },
  });
}

export function useUnarchiveProject(
  workspaceSlug: string,
  projectSlug: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => projectApi.unarchive(workspaceSlug, projectSlug),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(workspaceSlug, projectSlug),
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.list(workspaceSlug),
      });
    },
  });
}

export function useDeleteProject(workspaceSlug: string, projectSlug: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => projectApi.delete(workspaceSlug, projectSlug),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.list(workspaceSlug),
      });
      router.push(`/app/w/${workspaceSlug}/projects`);
    },
  });
}

export function useProjectMembers(workspaceSlug: string, projectSlug: string) {
  return useQuery({
    queryKey: projectKeys.members(workspaceSlug, projectSlug),
    queryFn: () => projectApi.listMembers(workspaceSlug, projectSlug),
    enabled: !!workspaceSlug && !!projectSlug,
  });
}

export function useAddProjectMember(
  workspaceSlug: string,
  projectSlug: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      projectApi.addMember(workspaceSlug, projectSlug, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.members(workspaceSlug, projectSlug),
      });
    },
  });
}

export function useRemoveProjectMember(
  workspaceSlug: string,
  projectSlug: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      projectApi.removeMember(workspaceSlug, projectSlug, memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.members(workspaceSlug, projectSlug),
      });
    },
  });
}
