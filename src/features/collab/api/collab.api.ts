import { API_URL } from "@/config/env";
import { apiClient } from "@/shared/lib/api-client";

export type Comment = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: unknown;
  workspaceId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type Attachment = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  isImage: boolean;
  url?: string | null;
  storageDriver?: "local" | "s3";
  uploadedBy: { id: string; name: string; email: string };
};

export type SearchResult = {
  query: string;
  projects: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    project: { id: string; name: string; slug: string; icon: string | null };
  }>;
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    };
  }>;
  comments: Array<{
    id: string;
    body: string;
    createdAt: string;
    author: { id: string; name: string };
    task: {
      id: string;
      title: string;
      project: { slug: string; name: string };
    };
  }>;
};

export const collabApi = {
  listComments: (ws: string, ps: string, taskId: string) =>
    apiClient<Comment[]>(
      `/workspaces/${ws}/projects/${ps}/tasks/${taskId}/comments`,
    ),

  createComment: (ws: string, ps: string, taskId: string, body: string) =>
    apiClient<Comment>(
      `/workspaces/${ws}/projects/${ps}/tasks/${taskId}/comments`,
      { method: "POST", body: { body } },
    ),

  deleteComment: (
    ws: string,
    ps: string,
    taskId: string,
    commentId: string,
  ) =>
    apiClient<{ message: string }>(
      `/workspaces/${ws}/projects/${ps}/tasks/${taskId}/comments/${commentId}`,
      { method: "DELETE" },
    ),

  listAttachments: (ws: string, ps: string, taskId: string) =>
    apiClient<Attachment[]>(
      `/workspaces/${ws}/projects/${ps}/tasks/${taskId}/attachments`,
    ),

  uploadAttachment: async (
    ws: string,
    ps: string,
    taskId: string,
    file: File,
  ) => {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(
      `${API_URL}/workspaces/${ws}/projects/${ps}/tasks/${taskId}/attachments`,
      { method: "POST", credentials: "include", body: form },
    );
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload?.error?.message ?? "Upload failed");
    }
    return payload.data as Attachment;
  },

  deleteAttachment: (
    ws: string,
    ps: string,
    taskId: string,
    attachmentId: string,
  ) =>
    apiClient<{ message: string }>(
      `/workspaces/${ws}/projects/${ps}/tasks/${taskId}/attachments/${attachmentId}`,
      { method: "DELETE" },
    ),

  downloadUrl: (ws: string, ps: string, taskId: string, attachmentId: string) =>
    `${API_URL}/workspaces/${ws}/projects/${ps}/tasks/${taskId}/attachments/${attachmentId}/download`,

  search: (ws: string, q: string) =>
    apiClient<SearchResult>(
      `/workspaces/${ws}/search?q=${encodeURIComponent(q)}`,
    ),

  notifications: (unreadOnly = false) =>
    apiClient<NotificationItem[]>(
      `/notifications${unreadOnly ? "?unread=1" : ""}`,
    ),

  unreadCount: () =>
    apiClient<{ count: number }>("/notifications/unread-count"),

  markRead: (id: string) =>
    apiClient<{ id: string; readAt: string | null }>(
      `/notifications/${id}/read`,
      { method: "POST" },
    ),

  markAllRead: () =>
    apiClient<{ message: string }>("/notifications/read-all", {
      method: "POST",
    }),
};
