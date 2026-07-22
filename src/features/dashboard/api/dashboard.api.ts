import { apiClient } from "@/shared/lib/api-client";
import type { ActivityFeedResult, DashboardOverview } from "../types";

export const dashboardApi = {
  getOverview: (workspaceSlug: string) =>
    apiClient<DashboardOverview>(`/workspaces/${workspaceSlug}/dashboard`),

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
