"use client";

import { use } from "react";
import { MyWorkPanel } from "@/features/dashboard";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function MyWorkPage({ params }: Props) {
  const { slug } = use(params);
  return <MyWorkPanel workspaceSlug={slug} />;
}
