"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Circle, Rocket, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useProjects, useCreateSampleProject, useLabels } from "@/features/project";
import {
  usePendingInvitations,
  useWorkspace,
  useWorkspaceCapabilities,
  useWorkspaceMembers,
} from "@/features/workspace";
import { ApiError } from "@/shared/types/api";
import { cn } from "@/shared/lib/utils";
import {
  onboardingDismissKey,
  onboardingFlagKey,
  readFlag,
  writeFlag,
} from "@/shared/lib/onboarding-storage";

type Props = { workspaceSlug: string };

export function OnboardingChecklist({ workspaceSlug }: Props) {
  const caps = useWorkspaceCapabilities(workspaceSlug);
  const { data: workspace } = useWorkspace(workspaceSlug);
  const { data: projects = [] } = useProjects(workspaceSlug);
  const { data: labels = [] } = useLabels(workspaceSlug);
  const { data: members = [] } = useWorkspaceMembers(workspaceSlug);
  const { data: invitations = [] } = usePendingInvitations(workspaceSlug);
  const sample = useCreateSampleProject(workspaceSlug);
  const [dismissed, setDismissed] = useState(true);
  const [visitedBoard, setVisitedBoard] = useState(false);
  const [visitedMyWork, setVisitedMyWork] = useState(false);
  const [createdTask, setCreatedTask] = useState(false);
  const [visitedCycles, setVisitedCycles] = useState(false);

  useEffect(() => {
    setDismissed(readFlag(onboardingDismissKey(workspaceSlug)));
    setVisitedBoard(readFlag(onboardingFlagKey(workspaceSlug, "visited-board")));
    setVisitedMyWork(readFlag(onboardingFlagKey(workspaceSlug, "visited-my-work")));
    setCreatedTask(readFlag(onboardingFlagKey(workspaceSlug, "created-task")));
    setVisitedCycles(readFlag(onboardingFlagKey(workspaceSlug, "visited-cycles")));
  }, [workspaceSlug]);

  const firstProject = projects[0];

  const steps = useMemo(() => {
    const hasProject = projects.length > 0;
    const hasInvite = members.length > 1 || invitations.length > 0;
    return [
      {
        id: "project",
        label: "Create your first project",
        done: hasProject,
        href: `/app/w/${workspaceSlug}/projects`,
        optional: false,
      },
      {
        id: "board",
        label: "Open a project board",
        done: visitedBoard && hasProject,
        href: firstProject
          ? `/app/w/${workspaceSlug}/projects/${firstProject.slug}`
          : `/app/w/${workspaceSlug}/projects`,
        optional: false,
      },
      {
        id: "task",
        label: "Create a task",
        done: createdTask,
        href: firstProject
          ? `/app/w/${workspaceSlug}/projects/${firstProject.slug}#create-task`
          : `/app/w/${workspaceSlug}/projects`,
        optional: false,
      },
      {
        id: "invite",
        label: "Invite a teammate",
        done: hasInvite,
        href: `/app/w/${workspaceSlug}#invite`,
        optional: false,
      },
      {
        id: "cycles",
        label: "Explore cycles",
        done: visitedCycles,
        href: `/app/w/${workspaceSlug}/cycles`,
        optional: true,
      },
      {
        id: "labels",
        label: "Set up workspace labels",
        done: labels.length > 0,
        href: `/app/w/${workspaceSlug}/labels`,
        optional: true,
      },
      {
        id: "my-work",
        label: "Open My Work",
        done: visitedMyWork,
        href: `/app/w/${workspaceSlug}/my-work`,
        optional: true,
      },
    ];
  }, [
    projects.length,
    members.length,
    invitations.length,
    labels.length,
    workspaceSlug,
    firstProject,
    visitedBoard,
    createdTask,
    visitedCycles,
    visitedMyWork,
  ]);

  const requiredDone = steps
    .filter((s) => !s.optional)
    .every((s) => s.done);
  const showSample = projects.length === 0 && caps.canCreateProject;

  if (caps.isViewOnly || dismissed || requiredDone) return null;

  return (
    <section className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-5 dark:border-primary-900/40 dark:from-primary-950/30 dark:to-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase dark:text-primary-300">
            Getting started
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-900 dark:text-zinc-50">
            Set up {workspace?.name ?? "your workspace"}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
            A few quick steps to start collaborating.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Dismiss onboarding"
          onClick={() => {
            writeFlag(onboardingDismissKey(workspaceSlug));
            setDismissed(true);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ul className="mt-4 space-y-2">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/70 dark:hover:bg-zinc-900/60",
                step.done && "text-slate-500",
              )}
            >
              {step.done ? (
                <Check className="h-4 w-4 text-emerald-600" aria-hidden />
              ) : (
                <Circle className="h-4 w-4 text-slate-400" aria-hidden />
              )}
              <span className={cn(step.done && "line-through")}>
                {step.label}
                {step.optional ? (
                  <span className="ml-1 text-xs text-slate-400">(optional)</span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {showSample ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            disabled={sample.isPending}
            onClick={() => sample.mutate()}
          >
            <Rocket className="h-4 w-4" />
            {sample.isPending ? "Creating…" : "Create sample project"}
          </Button>
          <Link href={`/app/w/${workspaceSlug}/projects`}>
            <Button type="button" variant="outline">
              Create empty project
            </Button>
          </Link>
          {sample.error instanceof ApiError ? (
            <p className="w-full text-sm text-danger-600">
              {sample.error.message}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
