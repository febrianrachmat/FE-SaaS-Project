"use client";

import { use, useEffect } from "react";
import { CyclesPanel } from "@/features/cycle";
import {
  onboardingFlagKey,
  writeFlag,
} from "@/shared/lib/onboarding-storage";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function CyclesPage({ params }: Props) {
  const { slug } = use(params);
  useEffect(() => {
    writeFlag(onboardingFlagKey(slug, "visited-cycles"));
  }, [slug]);
  return <CyclesPanel workspaceSlug={slug} />;
}
