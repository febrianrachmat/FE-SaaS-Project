"use client";

import { use } from "react";
import { CycleBoardPanel } from "@/features/cycle";

type Props = {
  params: Promise<{ slug: string; cycleId: string }>;
};

export default function CycleBoardPage({ params }: Props) {
  const { slug, cycleId } = use(params);
  return <CycleBoardPanel workspaceSlug={slug} cycleId={cycleId} />;
}
