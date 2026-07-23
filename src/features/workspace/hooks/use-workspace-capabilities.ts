"use client";

import {
  capabilitiesForRole,
  type WorkspaceCapabilities,
} from "@/shared/lib/rbac";
import { useWorkspace } from "./use-workspace";

export function useWorkspaceCapabilities(
  workspaceSlug: string,
): WorkspaceCapabilities {
  const { data } = useWorkspace(workspaceSlug);
  return capabilitiesForRole(data?.role);
}
