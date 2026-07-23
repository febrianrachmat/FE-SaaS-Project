import { API_URL } from "@/config/env";
import { apiClient } from "@/shared/lib/api-client";
import type { CreateProjectInput, CreateTaskInput } from "../schemas/project.schema";
import type {
  Project,
  Task,
  TaskDependencies,
  TaskDependency,
  TaskDependencyType,
  TaskLabel,
} from "../types";
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
        ...(payload.visibility ? { visibility: payload.visibility } : {}),
      },
    }),

  createSample: (workspaceSlug: string) =>
    apiClient<Project>(`/workspaces/${workspaceSlug}/projects/sample`, {
      method: "POST",
    }),

  get: (workspaceSlug: string, projectSlug: string) =>
    apiClient<Project>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}`,
    ),

  update: (
    workspaceSlug: string,
    projectSlug: string,
    payload: Partial<{
      name: string;
      description: string | null;
      icon: string | null;
      coverUrl: string | null;
      visibility: "PRIVATE" | "WORKSPACE";
      status: string;
      priority: string;
      deadline: string | null;
    }>,
  ) =>
    apiClient<Project>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}`,
      { method: "PATCH", body: payload },
    ),

  archive: (workspaceSlug: string, projectSlug: string) =>
    apiClient<Project>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/archive`,
      { method: "POST" },
    ),

  unarchive: (workspaceSlug: string, projectSlug: string) =>
    apiClient<Project>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/unarchive`,
      { method: "POST" },
    ),

  delete: (workspaceSlug: string, projectSlug: string) =>
    apiClient<{ message: string }>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}`,
      { method: "DELETE" },
    ),

  listMembers: (workspaceSlug: string, projectSlug: string) =>
    apiClient<
      Array<{
        id: string;
        userId: string;
        joinedAt: string;
        user: {
          id: string;
          name: string;
          email: string;
          avatarUrl: string | null;
        };
      }>
    >(`/workspaces/${workspaceSlug}/projects/${projectSlug}/members`),

  addMember: (
    workspaceSlug: string,
    projectSlug: string,
    userId: string,
  ) =>
    apiClient(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/members`,
      { method: "POST", body: { userId } },
    ),

  removeMember: (
    workspaceSlug: string,
    projectSlug: string,
    memberId: string,
  ) =>
    apiClient<{ message: string }>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/members/${memberId}`,
      { method: "DELETE" },
    ),

  toggleFavorite: (workspaceSlug: string, projectSlug: string) =>
    apiClient<{ isFavorite: boolean }>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/favorite`,
      { method: "POST" },
    ),

  listTasks: (
    workspaceSlug: string,
    projectSlug: string,
    params?: {
      status?: TaskStatus;
      priority?: TaskPriority;
      q?: string;
      assigneeId?: string;
      labelId?: string;
      cycleId?: string;
    },
  ) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.priority) search.set("priority", params.priority);
    if (params?.q) search.set("q", params.q);
    if (params?.assigneeId) search.set("assigneeId", params.assigneeId);
    if (params?.labelId) search.set("labelId", params.labelId);
    if (params?.cycleId) search.set("cycleId", params.cycleId);
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
          ...(payload.assigneeId ? { assigneeId: payload.assigneeId } : {}),
          ...(payload.parentId ? { parentId: payload.parentId } : {}),
          ...(typeof payload.storyPoints === "number"
            ? { storyPoints: payload.storyPoints }
            : {}),
          ...(typeof payload.estimatedMins === "number"
            ? { estimatedMins: payload.estimatedMins }
            : {}),
        },
      },
    ),

  getTask: (workspaceSlug: string, projectSlug: string, taskId: string) =>
    apiClient<Task>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks/${taskId}`,
    ),

  listSubtasks: (
    workspaceSlug: string,
    projectSlug: string,
    taskId: string,
  ) =>
    apiClient<Task[]>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks/${taskId}/subtasks`,
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
      assigneeId: string | null;
      cycleId: string | null;
      labelIds: string[];
      storyPoints: number | null;
      estimatedMins: number | null;
      actualMins: number | null;
    }>,
  ) =>
    apiClient<Task>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks/${taskId}`,
      { method: "PATCH", body: payload },
    ),

  bulkTasks: (
    workspaceSlug: string,
    projectSlug: string,
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
  ) =>
    apiClient<{ updated: number; deleted: number }>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks/bulk`,
      { method: "POST", body: payload },
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

  listDependencies: (
    workspaceSlug: string,
    projectSlug: string,
    taskId: string,
  ) =>
    apiClient<TaskDependencies>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks/${taskId}/dependencies`,
    ),

  addDependency: (
    workspaceSlug: string,
    projectSlug: string,
    taskId: string,
    payload: { toTaskId: string; type: TaskDependencyType },
  ) =>
    apiClient<TaskDependency>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks/${taskId}/dependencies`,
      { method: "POST", body: payload },
    ),

  removeDependency: (workspaceSlug: string, dependencyId: string) =>
    apiClient<{ message: string }>(
      `/workspaces/${workspaceSlug}/dependencies/${dependencyId}`,
      { method: "DELETE" },
    ),

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

  deleteChecklist: (workspaceSlug: string, itemId: string) =>
    apiClient<{ message: string }>(
      `/workspaces/${workspaceSlug}/checklist/${itemId}`,
      { method: "DELETE" },
    ),

  listLabels: (workspaceSlug: string) =>
    apiClient<TaskLabel[]>(`/workspaces/${workspaceSlug}/labels`),

  createLabel: (
    workspaceSlug: string,
    payload: { name: string; color?: string },
  ) =>
    apiClient<TaskLabel>(`/workspaces/${workspaceSlug}/labels`, {
      method: "POST",
      body: payload,
    }),

  updateLabel: (
    workspaceSlug: string,
    labelId: string,
    payload: { name?: string; color?: string },
  ) =>
    apiClient<TaskLabel>(`/workspaces/${workspaceSlug}/labels/${labelId}`, {
      method: "PATCH",
      body: payload,
    }),

  deleteLabel: (workspaceSlug: string, labelId: string) =>
    apiClient<{ message: string }>(
      `/workspaces/${workspaceSlug}/labels/${labelId}`,
      { method: "DELETE" },
    ),

  listShareLinks: (workspaceSlug: string, projectSlug: string) =>
    apiClient<
      Array<{
        id: string;
        projectId: string;
        tokenPrefix: string;
        expiresAt: string | null;
        revokedAt: string | null;
        lastUsedAt: string | null;
        createdAt: string;
      }>
    >(`/workspaces/${workspaceSlug}/projects/${projectSlug}/share-links`),

  createShareLink: (
    workspaceSlug: string,
    projectSlug: string,
    payload?: { expiresInDays?: number },
  ) =>
    apiClient<{
      id: string;
      token?: string;
      url?: string;
      tokenPrefix: string;
      expiresAt: string | null;
      createdAt: string;
    }>(`/workspaces/${workspaceSlug}/projects/${projectSlug}/share-links`, {
      method: "POST",
      body: payload ?? {},
    }),

  revokeShareLink: (
    workspaceSlug: string,
    projectSlug: string,
    linkId: string,
  ) =>
    apiClient(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/share-links/${linkId}`,
      { method: "DELETE" },
    ),

  resolveShareLink: (token: string) =>
    apiClient<{
      project: {
        name: string;
        description: string | null;
        icon: string | null;
        workspaceName: string;
      };
      tasks: Array<{
        id: string;
        title: string;
        status: string;
        priority: string;
        dueDate: string | null;
        assigneeName: string | null;
      }>;
    }>(`/share/${encodeURIComponent(token)}`),

  exportProject: async (
    workspaceSlug: string,
    projectSlug: string,
    format: "csv" | "json",
  ) => {
    const response = await fetch(
      `${API_URL}/workspaces/${workspaceSlug}/projects/${projectSlug}/export?format=${format}`,
      { method: "GET", credentials: "include" },
    );
    if (!response.ok) {
      let message = "Export failed";
      try {
        const payload = (await response.json()) as {
          error?: { message?: string };
        };
        message = payload?.error?.message ?? message;
      } catch {
        // ignore non-JSON error bodies
      }
      throw new Error(message);
    }

    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition");
    const matched = disposition?.match(/filename="([^"]+)"/);
    const filename =
      matched?.[1] ?? `${projectSlug}-export.${format === "csv" ? "csv" : "json"}`;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
};
