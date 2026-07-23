"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";

export const dashboardKeys = {
  overview: (slug: string) => ["dashboard", slug] as const,
  myWork: (slug: string, filters?: string) =>
    ["my-work", slug, filters ?? ""] as const,
  activity: (
    slug: string,
    filters?: { projectSlug?: string; action?: string },
  ) =>
    [
      "activity",
      slug,
      filters?.projectSlug ?? "",
      filters?.action ?? "",
    ] as const,
};

export function useDashboard(workspaceSlug: string) {
  return useQuery({
    queryKey: dashboardKeys.overview(workspaceSlug),
    queryFn: () => dashboardApi.getOverview(workspaceSlug),
    enabled: !!workspaceSlug,
  });
}

export function useMyWork(
  workspaceSlug: string,
  filters?: {
    status?: string;
    priority?: string;
    q?: string;
    includeDone?: boolean;
    page?: number;
    limit?: number;
  },
) {
  const key = JSON.stringify(filters ?? {});
  return useQuery({
    queryKey: dashboardKeys.myWork(workspaceSlug, key),
    queryFn: () => dashboardApi.getMyWork(workspaceSlug, filters),
    enabled: !!workspaceSlug,
  });
}

export function useActivityFeed(
  workspaceSlug: string,
  filters?: { projectSlug?: string; action?: string },
) {
  return useInfiniteQuery({
    queryKey: dashboardKeys.activity(workspaceSlug, filters),
    queryFn: ({ pageParam }) =>
      dashboardApi.listActivity(workspaceSlug, {
        cursor: pageParam,
        limit: 30,
        projectSlug: filters?.projectSlug,
        action: filters?.action,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!workspaceSlug,
  });
}
