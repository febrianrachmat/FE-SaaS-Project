"use client";

import { useQuery } from "@tanstack/react-query";
import { roadmapApi } from "../api/roadmap.api";

export const roadmapKeys = {
  list: (ws: string, from: string, to: string) =>
    ["roadmap", ws, from, to] as const,
};

export function useRoadmap(
  workspaceSlug: string,
  from: string,
  to: string,
) {
  return useQuery({
    queryKey: roadmapKeys.list(workspaceSlug, from, to),
    queryFn: () => roadmapApi.list(workspaceSlug, from, to),
    enabled: !!workspaceSlug && !!from && !!to,
  });
}
