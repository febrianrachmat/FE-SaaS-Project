"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";

export const dashboardKeys = {
  overview: (slug: string) => ["dashboard", slug] as const,
};

export function useDashboard(workspaceSlug: string) {
  return useQuery({
    queryKey: dashboardKeys.overview(workspaceSlug),
    queryFn: () => dashboardApi.getOverview(workspaceSlug),
    enabled: !!workspaceSlug,
  });
}
