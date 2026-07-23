"use client";

import { use, useEffect } from "react";
import { MyWorkPanel } from "@/features/dashboard";
import {
  onboardingFlagKey,
  writeFlag,
} from "@/shared/lib/onboarding-storage";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function MyWorkPage({ params }: Props) {
  const { slug } = use(params);
  useEffect(() => {
    writeFlag(onboardingFlagKey(slug, "visited-my-work"));
  }, [slug]);
  return <MyWorkPanel workspaceSlug={slug} />;
}
