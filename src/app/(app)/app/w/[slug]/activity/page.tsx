"use client";

import { use } from "react";
import { ActivityFeed } from "@/features/dashboard";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function WorkspaceActivityPage({ params }: Props) {
  const { slug } = use(params);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Activity
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Everything happening in /{slug}
        </p>
      </div>
      <ActivityFeed workspaceSlug={slug} />
    </div>
  );
}
