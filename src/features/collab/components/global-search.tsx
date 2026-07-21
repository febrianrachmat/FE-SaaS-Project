"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { collabApi } from "../api/collab.api";
import { collabKeys } from "../hooks/use-collab";
import { useWorkspaceStore } from "@/features/workspace";
import { cn } from "@/shared/lib/utils";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const workspaceSlug = useWorkspaceStore((s) => s.activeSlug);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: collabKeys.search(workspaceSlug ?? "", q),
    queryFn: () => collabApi.search(workspaceSlug!, q),
    enabled: open && !!workspaceSlug && q.trim().length >= 2,
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        aria-keyshortcuts="Meta+K Control+K"
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <Search className="h-4 w-4" aria-hidden />
        <span>Search…</span>
        <kbd className="ml-8 hidden rounded border border-slate-200 px-1.5 text-[10px] dark:border-zinc-700 sm:inline">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh]">
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-950"
            role="dialog"
            aria-label="Search"
          >
            <div className="flex items-center gap-2 border-b border-slate-200 px-3 dark:border-zinc-800">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={
                  workspaceSlug
                    ? "Search projects, tasks, members, comments…"
                    : "Select a workspace first"
                }
                disabled={!workspaceSlug}
                className="h-12 flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                className="text-xs text-slate-400"
                onClick={() => setOpen(false)}
              >
                Esc
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {!workspaceSlug ? (
                <p className="px-2 py-6 text-center text-sm text-slate-400">
                  Choose a workspace to search.
                </p>
              ) : q.trim().length < 2 ? (
                <p className="px-2 py-6 text-center text-sm text-slate-400">
                  Type at least 2 characters.
                </p>
              ) : isFetching ? (
                <p className="px-2 py-6 text-center text-sm text-slate-400">
                  Searching…
                </p>
              ) : data ? (
                <div className="space-y-3">
                  <ResultGroup title="Projects">
                    {data.projects.map((p) => (
                      <Link
                        key={p.id}
                        href={`/app/w/${workspaceSlug}/projects/${p.slug}`}
                        className={resultClass}
                        onClick={() => setOpen(false)}
                      >
                        {p.icon ?? "📁"} {p.name}
                      </Link>
                    ))}
                    {data.projects.length === 0 ? <Empty /> : null}
                  </ResultGroup>
                  <ResultGroup title="Tasks">
                    {data.tasks.map((t) => (
                      <Link
                        key={t.id}
                        href={`/app/w/${workspaceSlug}/projects/${t.project.slug}`}
                        className={resultClass}
                        onClick={() => setOpen(false)}
                      >
                        {t.title}
                        <span className="ml-2 text-xs text-slate-400">
                          {t.project.name}
                        </span>
                      </Link>
                    ))}
                    {data.tasks.length === 0 ? <Empty /> : null}
                  </ResultGroup>
                  <ResultGroup title="Members">
                    {data.members.map((m) => (
                      <div key={m.id} className={resultClass}>
                        {m.user.name}
                        <span className="ml-2 text-xs text-slate-400">
                          {m.user.email}
                        </span>
                      </div>
                    ))}
                    {data.members.length === 0 ? <Empty /> : null}
                  </ResultGroup>
                  <ResultGroup title="Comments">
                    {data.comments.map((c) => (
                      <Link
                        key={c.id}
                        href={`/app/w/${workspaceSlug}/projects/${c.task.project.slug}`}
                        className={resultClass}
                        onClick={() => setOpen(false)}
                      >
                        <span className="line-clamp-1">{c.body}</span>
                      </Link>
                    ))}
                    {data.comments.length === 0 ? <Empty /> : null}
                  </ResultGroup>
                </div>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            className="absolute inset-0 -z-10"
            aria-label="Close search"
            onClick={() => setOpen(false)}
          />
        </div>
      ) : null}
    </>
  );
}

const resultClass = cn(
  "block rounded-lg px-2 py-2 text-sm hover:bg-slate-100 dark:hover:bg-zinc-900",
);

function ResultGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="px-2 pb-1 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="px-2 py-1 text-xs text-slate-400">No matches</p>;
}
