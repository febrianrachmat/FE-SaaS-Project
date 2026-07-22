"use client";

import { use } from "react";
import { RoadmapTimeline } from "@/features/roadmap";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function WorkspaceRoadmapPage({ params }: Props) {
  const { slug } = use(params);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Roadmap
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Timeline of tasks with due dates in /{slug}
        </p>
      </div>
      <RoadmapTimeline workspaceSlug={slug} />
    </div>
  );
}
