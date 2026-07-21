"use client";

import Link from "next/link";
import { TaskCalendar } from "@/features/project";
import { useWorkspaceStore } from "@/features/workspace";
import { EmptyState } from "@/shared/ui/empty-state";
import { CalendarDays } from "lucide-react";

export default function CalendarPage() {
  const activeSlug = useWorkspaceStore((s) => s.activeSlug);

  if (!activeSlug) {
    return (
      <EmptyState
        icon={<CalendarDays className="h-10 w-10" />}
        title="Select a workspace"
        description="Open a workspace first to see tasks on the calendar."
        actionLabel="Go to dashboard"
        onAction={() => {
          window.location.href = "/app";
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Calendar
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Due dates across{" "}
          <Link
            href={`/app/w/${activeSlug}`}
            className="text-primary-600 hover:underline"
          >
            /{activeSlug}
          </Link>
        </p>
      </div>
      <TaskCalendar workspaceSlug={activeSlug} />
    </div>
  );
}
