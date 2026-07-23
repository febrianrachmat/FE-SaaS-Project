import { apiClient } from "@/shared/lib/api-client";

export type TrashProjectItem = {
  type: "project";
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  deletedAt: string;
};

export type TrashTaskItem = {
  type: "task";
  id: string;
  title: string;
  status: string;
  priority: string;
  deletedAt: string;
  project: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    deleted: boolean;
  };
};

export type TrashList = {
  projects: TrashProjectItem[];
  tasks: TrashTaskItem[];
};

export const trashApi = {
  list: (workspaceSlug: string) =>
    apiClient<TrashList>(`/workspaces/${workspaceSlug}/trash`),

  restoreProject: (workspaceSlug: string, projectSlug: string) =>
    apiClient<{ message: string }>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/restore`,
      { method: "POST" },
    ),

  restoreTask: (
    workspaceSlug: string,
    projectSlug: string,
    taskId: string,
  ) =>
    apiClient<{ message: string }>(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks/${taskId}/restore`,
      { method: "POST" },
    ),
};
