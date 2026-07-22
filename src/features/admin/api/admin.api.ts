import { apiClient } from "@/shared/lib/api-client";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  systemRole: "USER" | "SYSTEM_ADMIN";
  emailVerifiedAt: string | null;
  createdAt: string;
  workspaceCount: number;
};

export type AdminStats = {
  users: number;
  workspaces: number;
  projects: number;
  tasks: number;
};

export const adminApi = {
  stats: () => apiClient<AdminStats>("/admin/stats"),
  listUsers: () => apiClient<AdminUser[]>("/admin/users"),
  updateSystemRole: (userId: string, systemRole: "USER" | "SYSTEM_ADMIN") =>
    apiClient<{ id: string; email: string; name: string; systemRole: string }>(
      `/admin/users/${userId}`,
      { method: "PATCH", body: { systemRole } },
    ),
};
