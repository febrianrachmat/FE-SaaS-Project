"use client";

import { use } from "react";
import { TaskCalendar } from "@/features/project";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function WorkspaceCalendarPage({ params }: Props) {
  const { slug } = use(params);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Calendar
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Task due dates in /{slug}
        </p>
      </div>
      <TaskCalendar workspaceSlug={slug} />
    </div>
  );
}
