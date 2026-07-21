import { apiClient } from "@/shared/lib/api-client";
import type { DashboardOverview } from "../types";

export const dashboardApi = {
  getOverview: (workspaceSlug: string) =>
    apiClient<DashboardOverview>(`/workspaces/${workspaceSlug}/dashboard`),
};
