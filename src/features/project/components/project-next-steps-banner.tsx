"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListTodo, Repeat, UserPlus, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  nextStepsDismissKey,
  readFlag,
  writeFlag,
} from "@/shared/lib/onboarding-storage";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
};

export function ProjectNextStepsBanner({
  workspaceSlug,
  projectSlug,
}: Props) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(readFlag(nextStepsDismissKey(workspaceSlug, projectSlug)));
  }, [workspaceSlug, projectSlug]);

  if (hidden) return null;

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-3 dark:border-sky-900/50 dark:bg-sky-950/30">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-zinc-50">
          Next steps on this board
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          Create a task, invite someone, or plan work in a cycle.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              document.getElementById("task-title")?.focus();
              document
                .getElementById("create-task")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <ListTodo className="h-3.5 w-3.5" />
            Create a task
          </Button>
          <Link href={`/app/w/${workspaceSlug}#invite`}>
            <Button type="button" size="sm" variant="outline">
              <UserPlus className="h-3.5 w-3.5" />
              Invite teammate
            </Button>
          </Link>
          <Link href={`/app/w/${workspaceSlug}/cycles`}>
            <Button type="button" size="sm" variant="outline">
              <Repeat className="h-3.5 w-3.5" />
              Open cycles
            </Button>
          </Link>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Dismiss next steps"
        onClick={() => {
          writeFlag(nextStepsDismissKey(workspaceSlug, projectSlug));
          setHidden(true);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
