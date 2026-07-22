"use client";

import { use } from "react";
import { LabelsPanel } from "@/features/project";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function LabelsPage({ params }: Props) {
  const { slug } = use(params);
  return <LabelsPanel workspaceSlug={slug} />;
}
