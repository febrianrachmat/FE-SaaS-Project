"use client";

import Link from "next/link";
import { ChevronDown, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { useWorkspaces } from "../hooks/use-workspace";
import { useWorkspaceStore } from "../stores/workspace-store";

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const { data: workspaces, isLoading } = useWorkspaces();
  const { activeSlug, setActiveWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (!workspaces?.length) return;
    const active =
      workspaces.find((w) => w.slug === activeSlug) ?? workspaces[0];
    setActiveWorkspace(active);
  }, [workspaces, activeSlug, setActiveWorkspace]);

  const current =
    workspaces?.find((w) => w.slug === activeSlug) ?? workspaces?.[0];

  return (
    <div className="relative px-2 pb-2">
      <Button
        variant="secondary"
        className="w-full justify-between"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate">
          {isLoading ? "Loading…" : (current?.name ?? "No workspace")}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
      </Button>

      {open ? (
        <div
          className="absolute left-2 right-2 z-20 mt-1 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          role="listbox"
        >
          {workspaces?.map((ws) => (
            <Link
              key={ws.id}
              href={`/app/w/${ws.slug}`}
              role="option"
              aria-selected={ws.slug === current?.slug}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800",
                ws.slug === current?.slug && "bg-slate-100 dark:bg-zinc-800",
              )}
              onClick={() => {
                setActiveWorkspace(ws);
                setOpen(false);
              }}
            >
              <span className="font-medium">{ws.name}</span>
              <span className="mt-0.5 block text-xs text-slate-400">
                {ws.role?.toLowerCase().replace("_", " ")} · {ws.memberCount ?? 0}{" "}
                members
              </span>
            </Link>
          ))}
          <Link
            href="/app/workspaces/new"
            className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
            onClick={() => setOpen(false)}
          >
            <Plus className="h-4 w-4" />
            New workspace
          </Link>
        </div>
      ) : null}
    </div>
  );
}
