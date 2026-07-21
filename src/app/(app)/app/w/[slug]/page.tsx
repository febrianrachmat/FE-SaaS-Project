"use client";

import Link from "next/link";
import { use } from "react";
import {
  InviteMemberForm,
  MembersList,
  useWorkspace,
} from "@/features/workspace";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Settings, Users } from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function WorkspaceHomePage({ params }: PageProps) {
  const { slug } = use(params);
  const { data, isLoading, isError } = useWorkspace(slug);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Workspace not found"
        description="You may not have access, or it was deleted."
        actionLabel="Back to dashboard"
        onAction={() => {
          window.location.href = "/app";
        }}
      />
    );
  }

  const canInvite =
    data.role === "ADMIN" || data.role === "OWNER";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            {data.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {data.description || "No description yet."}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            /{data.slug} · {data.memberCount ?? 0} members · your role:{" "}
            {data.role?.replace("_", " ")}
          </p>
        </div>
        <Link href={`/app/w/${slug}/settings`}>
          <Button variant="outline">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-zinc-300">
            Members
          </h2>
        </div>
        {canInvite ? <InviteMemberForm slug={slug} /> : null}
        <MembersList slug={slug} canManage={canInvite} />
      </section>
    </div>
  );
}
