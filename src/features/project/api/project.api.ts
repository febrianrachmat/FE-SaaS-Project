import { apiClient } from "@/shared/lib/api-client";
import type { CreateProjectInput, CreateTaskInput } from "../schemas/project.schema";
import type { Project, Task, TaskLabel } from "../types";
import type { TaskPriority, TaskStatus } from "@/shared/types/domain";

export const projectApi = {
  list: (workspaceSlug: string) =>
    apiClient<Project[]>(`/workspaces/${workspaceSlug}/projects`),

  create: (workspaceSlug: string, payload: CreateProjectInput) =>
    apiClient<Project>(`/workspaces/${workspaceSlug}/projects`, {
      method: "POST",
      body: {
        name: payload.name,
        ...(payload.slug ? { slug: payload.slug } : {}),
        ...(payload.description ? { description: payload.description } : {}),
        ...(payload.icon ? { icon: payload.icon } : {}),
        ...(payload.priority ? { priority: payload.priority } : {}),
      },
    }),

  get: (workspaceSlug: string, projectSlug: string) =>
    apiClient<Project>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}`,
    ),

  toggleFavorite: (workspaceSlug: string, projectSlug: string) =>
    apiClient<{ isFavorite: boolean }>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/favorite`,
      { method: "POST" },
    ),

  listTasks: (
    workspaceSlug: string,
    projectSlug: string,
    params?: { status?: TaskStatus; priority?: TaskPriority; q?: string },
  ) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.priority) search.set("priority", params.priority);
    if (params?.q) search.set("q", params.q);
    const qs = search.toString();
    return apiClient<Task[]>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks${qs ? `?${qs}` : ""}`,
    );
  },

  createTask: (
    workspaceSlug: string,
    projectSlug: string,
    payload: CreateTaskInput,
  ) =>
    apiClient<Task>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks`,
      {
        method: "POST",
        body: {
          title: payload.title,
          ...(payload.description
            ? { description: payload.description }
            : {}),
          ...(payload.status ? { status: payload.status } : {}),
          ...(payload.priority ? { priority: payload.priority } : {}),
          ...(payload.dueDate ? { dueDate: payload.dueDate } : {}),
        },
      },
    ),

  getTask: (workspaceSlug: string, projectSlug: string, taskId: string) =>
    apiClient<Task>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks/${taskId}`,
    ),

  updateTask: (
    workspaceSlug: string,
    projectSlug: string,
    taskId: string,
    payload: Partial<{
      title: string;
      description: string | null;
      status: TaskStatus;
      priority: TaskPriority;
      dueDate: string | null;
    }>,
  ) =>
    apiClient<Task>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks/${taskId}`,
      { method: "PATCH", body: payload },
    ),

  deleteTask: (
    workspaceSlug: string,
    projectSlug: string,
    taskId: string,
  ) =>
    apiClient<{ message: string }>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks/${taskId}`,
      { method: "DELETE" },
    ),

  moveTask: (
    workspaceSlug: string,
    projectSlug: string,
    taskId: string,
    payload: { status: TaskStatus; position: number },
  ) =>
    apiClient<Task>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks/${taskId}/move`,
      { method: "POST", body: payload },
    ),

  calendar: (workspaceSlug: string, from: string, to: string) =>
    apiClient<
      Array<
        Task & {
          project: {
            id: string;
            name: string;
            slug: string;
            icon: string | null;
          };
        }
      >
    >(`/workspaces/${workspaceSlug}/calendar?from=${from}&to=${to}`),

  addChecklist: (
    workspaceSlug: string,
    projectSlug: string,
    taskId: string,
    title: string,
  ) =>
    apiClient(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks/${taskId}/checklist`,
      { method: "POST", body: { title } },
    ),

  updateChecklist: (
    workspaceSlug: string,
    itemId: string,
    payload: { title?: string; isDone?: boolean },
  ) =>
    apiClient(`/workspaces/${workspaceSlug}/checklist/${itemId}`, {
      method: "PATCH",
      body: payload,
    }),

  listLabels: (workspaceSlug: string) =>
    apiClient<TaskLabel[]>(`/workspaces/${workspaceSlug}/labels`),
};
