"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { useWorkspaceMembers } from "@/features/workspace";
import {
  useAddProjectMember,
  useProjectMembers,
  useRemoveProjectMember,
  useUpdateProject,
} from "../hooks/use-project";
import type { Project } from "../types";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  project: Project;
};

export function ProjectAccessPanel({
  workspaceSlug,
  projectSlug,
  project,
}: Props) {
  const update = useUpdateProject(workspaceSlug, projectSlug);
  const { data: projectMembers = [] } = useProjectMembers(
    workspaceSlug,
    projectSlug,
  );
  const { data: workspaceMembers = [] } = useWorkspaceMembers(workspaceSlug);
  const addMember = useAddProjectMember(workspaceSlug, projectSlug);
  const removeMember = useRemoveProjectMember(workspaceSlug, projectSlug);
  const [addUserId, setAddUserId] = useState("");

  const memberIds = new Set(projectMembers.map((m) => m.userId));
  const candidates = workspaceMembers.filter((m) => !memberIds.has(m.userId));
  const isPrivate = project.visibility === "PRIVATE";

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
            Access
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Control who can see this project.
          </p>
        </div>
        <label className="text-xs text-slate-500">
          Visibility
          <select
            className="mt-1 flex h-9 min-w-[200px] rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={project.visibility}
            disabled={update.isPending}
            onChange={(e) =>
              update.mutate({
                visibility: e.target.value as "PRIVATE" | "WORKSPACE",
              })
            }
          >
            <option value="WORKSPACE">Workspace</option>
            <option value="PRIVATE">Private</option>
          </select>
        </label>
      </div>

      {isPrivate ? (
        <>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 dark:divide-zinc-800 dark:border-zinc-800">
            {projectMembers.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{m.user.name}</p>
                  <p className="text-xs text-slate-500">{m.user.email}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={removeMember.isPending || projectMembers.length <= 1}
                  onClick={() => removeMember.mutate(m.id)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!addUserId) return;
              addMember.mutate(addUserId, {
                onSuccess: () => setAddUserId(""),
              });
            }}
          >
            <select
              className="h-9 min-w-[200px] flex-1 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={addUserId}
              onChange={(e) => setAddUserId(e.target.value)}
            >
              <option value="">Add workspace member…</option>
              {candidates.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name}
                </option>
              ))}
            </select>
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              disabled={!addUserId || addMember.isPending}
            >
              Add
            </Button>
          </form>
        </>
      ) : (
        <p className="text-xs text-slate-500">
          All workspace members can access this project. Switch to Private to
          limit access to invited members.
        </p>
      )}
    </section>
  );
}
