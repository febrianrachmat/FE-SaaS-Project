"use client";

import { use } from "react";
import { TrashPanel } from "@/features/trash";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function WorkspaceTrashPage({ params }: Props) {
  const { slug } = use(params);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Trash
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Restore soft-deleted projects and tasks in /{slug}
        </p>
      </div>
      <TrashPanel workspaceSlug={slug} />
    </div>
  );
}
