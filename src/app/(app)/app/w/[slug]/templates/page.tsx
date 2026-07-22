"use client";

import { use } from "react";
import { TemplatesPanel } from "@/features/templates";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function TemplatesPage({ params }: Props) {
  const { slug } = use(params);
  return <TemplatesPanel workspaceSlug={slug} />;
}
