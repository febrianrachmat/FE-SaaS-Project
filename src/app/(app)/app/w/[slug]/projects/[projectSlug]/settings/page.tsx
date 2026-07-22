"use client";

import { use } from "react";
import { ProjectSettingsPanel } from "@/features/project";

type Props = {
  params: Promise<{ slug: string; projectSlug: string }>;
};

export default function ProjectSettingsPage({ params }: Props) {
  const { slug, projectSlug } = use(params);
  return (
    <ProjectSettingsPanel workspaceSlug={slug} projectSlug={projectSlug} />
  );
}
