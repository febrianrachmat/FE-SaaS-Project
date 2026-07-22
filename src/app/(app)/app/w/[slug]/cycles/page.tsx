"use client";

import { use } from "react";
import { CyclesPanel } from "@/features/cycle";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function CyclesPage({ params }: Props) {
  const { slug } = use(params);
  return <CyclesPanel workspaceSlug={slug} />;
}
