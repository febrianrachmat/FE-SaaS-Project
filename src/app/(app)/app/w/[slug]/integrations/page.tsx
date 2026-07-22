"use client";

import { use } from "react";
import { IntegrationsPanel } from "@/features/integrations";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function IntegrationsPage({ params }: Props) {
  const { slug } = use(params);
  return <IntegrationsPanel workspaceSlug={slug} />;
}
