import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workspace } from "../types";

type WorkspaceState = {
  activeSlug: string | null;
  setActiveSlug: (slug: string | null) => void;
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace | null) => void;
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeSlug: null,
      activeWorkspace: null,
      setActiveSlug: (slug) => set({ activeSlug: slug }),
      setActiveWorkspace: (workspace) =>
        set({
          activeWorkspace: workspace,
          activeSlug: workspace?.slug ?? null,
        }),
    }),
    { name: "flowpilot-active-workspace" },
  ),
);
