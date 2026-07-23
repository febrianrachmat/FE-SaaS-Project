"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Map as MapIcon,
  RefreshCw,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { collabApi } from "../api/collab.api";
import { collabKeys } from "../hooks/use-collab";
import { useWorkspaceStore } from "@/features/workspace";
import { cn } from "@/shared/lib/utils";

type PaletteItem = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  href: string;
  icon?: ReactNode;
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const workspaceSlug = useWorkspaceStore((s) => s.activeSlug);
  const debouncedQ = useDebouncedValue(q.trim(), 200);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) {
      setQ("");
      setActiveIndex(0);
      return;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const { data, isFetching } = useQuery({
    queryKey: collabKeys.search(workspaceSlug ?? "", debouncedQ),
    queryFn: () => collabApi.search(workspaceSlug!, debouncedQ),
    enabled: open && !!workspaceSlug && debouncedQ.length >= 2,
  });

  const quickActions = useMemo<PaletteItem[]>(() => {
    if (!workspaceSlug) return [];
    const base = `/app/w/${workspaceSlug}`;
    return [
      {
        id: "nav-dashboard",
        group: "Navigate",
        label: "Go to Dashboard",
        href: base,
        icon: <LayoutDashboard className="h-3.5 w-3.5" />,
      },
      {
        id: "nav-projects",
        group: "Navigate",
        label: "Go to Projects",
        href: `${base}/projects`,
        icon: <FolderKanban className="h-3.5 w-3.5" />,
      },
      {
        id: "nav-my-work",
        group: "Navigate",
        label: "Go to My Work",
        href: `${base}/my-work`,
        icon: <ListTodo className="h-3.5 w-3.5" />,
      },
      {
        id: "nav-roadmap",
        group: "Navigate",
        label: "Go to Roadmap",
        href: `${base}/roadmap`,
        icon: <MapIcon className="h-3.5 w-3.5" />,
      },
      {
        id: "nav-cycles",
        group: "Navigate",
        label: "Go to Cycles",
        href: `${base}/cycles`,
        icon: <RefreshCw className="h-3.5 w-3.5" />,
      },
      {
        id: "nav-calendar",
        group: "Navigate",
        label: "Go to Calendar",
        href: `${base}/calendar`,
        icon: <Calendar className="h-3.5 w-3.5" />,
      },
      {
        id: "nav-members",
        group: "Navigate",
        label: "Go to Members",
        href: `${base}/settings`,
        icon: <Users className="h-3.5 w-3.5" />,
      },
      {
        id: "nav-settings",
        group: "Navigate",
        label: "Workspace settings",
        href: `${base}/settings`,
        icon: <Settings className="h-3.5 w-3.5" />,
      },
    ];
  }, [workspaceSlug]);

  const filteredQuick = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return quickActions;
    return quickActions.filter((a) => a.label.toLowerCase().includes(query));
  }, [q, quickActions]);

  const searchItems = useMemo<PaletteItem[]>(() => {
    if (!workspaceSlug || !data || debouncedQ.length < 2) return [];
    const items: PaletteItem[] = [];

    for (const p of data.projects) {
      items.push({
        id: `project-${p.id}`,
        group: "Projects",
        label: `${p.icon ?? "📁"} ${p.name}`,
        hint: p.slug,
        href: `/app/w/${workspaceSlug}/projects/${p.slug}`,
      });
    }
    for (const t of data.tasks) {
      items.push({
        id: `task-${t.id}`,
        group: "Tasks",
        label: t.title,
        hint: `${t.project.name} · ${t.status.replace("_", " ")}`,
        href: `/app/w/${workspaceSlug}/projects/${t.project.slug}?task=${t.id}`,
      });
    }
    for (const m of data.members) {
      items.push({
        id: `member-${m.id}`,
        group: "Members",
        label: m.user.name,
        hint: m.user.email,
        href: `/app/w/${workspaceSlug}/settings`,
      });
    }
    for (const c of data.comments) {
      items.push({
        id: `comment-${c.id}`,
        group: "Comments",
        label: c.body,
        hint: c.task.title,
        href: `/app/w/${workspaceSlug}/projects/${c.task.project.slug}?task=${c.task.id}`,
      });
    }
    return items;
  }, [data, debouncedQ, workspaceSlug]);

  const items = useMemo(() => {
    if (!workspaceSlug) return [];
    if (debouncedQ.length >= 2) {
      return [...filteredQuick, ...searchItems];
    }
    return filteredQuick;
  }, [workspaceSlug, debouncedQ, filteredQuick, searchItems]);

  useEffect(() => {
    setActiveIndex(0);
  }, [q, open, items.length]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-palette-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function close() {
    setOpen(false);
  }

  function go(href: string) {
    close();
    router.push(href);
  }

  function onInputKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (items.length === 0) return;
      setActiveIndex((i) => (i + 1) % items.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (items.length === 0) return;
      setActiveIndex((i) => (i - 1 + items.length) % items.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) go(item.href);
    }
  }

  const groups = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const item of items) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return Array.from(map.entries());
  }, [items]);

  let flatIndex = -1;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        aria-keyshortcuts="Meta+K Control+K"
        className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">Search or jump to…</span>
        <kbd className="ml-auto hidden rounded border border-slate-200 px-1.5 text-[10px] dark:border-zinc-700 sm:inline">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh]">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close command palette"
            onClick={close}
          />
          <div
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-950"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-2 border-b border-slate-200 px-3 dark:border-zinc-800">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder={
                  workspaceSlug
                    ? "Search tasks, projects… or jump somewhere"
                    : "Select a workspace first"
                }
                disabled={!workspaceSlug}
                className="h-12 flex-1 bg-transparent text-sm outline-none"
                aria-autocomplete="list"
                aria-controls="command-palette-list"
              />
              <button
                type="button"
                className="text-xs text-slate-400"
                onClick={close}
              >
                Esc
              </button>
            </div>

            <div
              id="command-palette-list"
              ref={listRef}
              className="max-h-96 overflow-y-auto p-2"
              role="listbox"
            >
              {!workspaceSlug ? (
                <p className="px-2 py-6 text-center text-sm text-slate-400">
                  Choose a workspace to search.
                </p>
              ) : items.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-slate-400">
                  {debouncedQ.length >= 2 && isFetching
                    ? "Searching…"
                    : debouncedQ.length >= 2
                      ? "No matches"
                      : "Type to search, or pick a destination"}
                </p>
              ) : (
                <div className="space-y-3">
                  {groups.map(([title, groupItems]) => (
                    <div key={title}>
                      <p className="px-2 pb-1 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                        {title}
                      </p>
                      {groupItems.map((item) => {
                        flatIndex += 1;
                        const index = flatIndex;
                        const active = index === activeIndex;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            role="option"
                            aria-selected={active}
                            data-palette-index={index}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm",
                              active
                                ? "bg-primary-50 text-slate-900 dark:bg-primary-950/40 dark:text-zinc-50"
                                : "hover:bg-slate-100 dark:hover:bg-zinc-900",
                            )}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => go(item.href)}
                          >
                            {item.icon ? (
                              <span className="text-slate-400">{item.icon}</span>
                            ) : null}
                            <span className="min-w-0 flex-1 truncate">
                              {item.label}
                            </span>
                            {item.hint ? (
                              <span className="max-w-[40%] truncate text-xs text-slate-400">
                                {item.hint}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  {debouncedQ.length >= 2 && isFetching ? (
                    <p className="px-2 py-1 text-xs text-slate-400">
                      Updating results…
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
