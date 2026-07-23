import { apiClient, apiClientWithMeta } from "@/shared/lib/api-client";
import type { ActivityFeedResult, DashboardOverview, MyWorkItem } from "../types";

export const dashboardApi = {
  getOverview: (workspaceSlug: string) =>
    apiClient<DashboardOverview>(`/workspaces/${workspaceSlug}/dashboard`),

  getMyWork: (
    workspaceSlug: string,
    params?: {
      status?: string;
      priority?: string;
      q?: string;
      includeDone?: boolean;
      page?: number;
      limit?: number;
    },
  ) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.priority) search.set("priority", params.priority);
    if (params?.q) search.set("q", params.q);
    if (params?.includeDone) search.set("includeDone", "true");
    search.set("page", String(params?.page ?? 1));
    search.set("limit", String(params?.limit ?? 20));
    const qs = search.toString();
    return apiClientWithMeta<MyWorkItem[]>(
      `/workspaces/${workspaceSlug}/dashboard/my-work?${qs}`,
    );
  },

  listActivity: (
    workspaceSlug: string,
    params?: {
      cursor?: string;
      limit?: number;
      projectSlug?: string;
      action?: string;
    },
  ) => {
    const search = new URLSearchParams();
    if (params?.cursor) search.set("cursor", params.cursor);
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.projectSlug) search.set("projectSlug", params.projectSlug);
    if (params?.action) search.set("action", params.action);
    const qs = search.toString();
    return apiClient<ActivityFeedResult>(
      `/workspaces/${workspaceSlug}/activity${qs ? `?${qs}` : ""}`,
    );
  },
};
