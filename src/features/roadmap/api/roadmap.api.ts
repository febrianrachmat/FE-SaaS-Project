import { apiClient } from "@/shared/lib/api-client";
import type { RoadmapTask } from "@/features/project/types";

export const roadmapApi = {
  list: (workspaceSlug: string, from: string, to: string) =>
    apiClient<RoadmapTask[]>(
      `/workspaces/${workspaceSlug}/roadmap?from=${from}&to=${to}`,
    ),
};
