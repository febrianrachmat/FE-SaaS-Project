"use client";

import { useCallback, useEffect, useState } from "react";
import {
  SHORTCUT_HELP,
  useKeyboardShortcuts,
} from "@/shared/hooks/use-keyboard-shortcuts";
import {
  useWorkspaceCapabilities,
  useWorkspaceStore,
} from "@/features/workspace";

export function KeyboardShortcuts() {
  const [helpOpen, setHelpOpen] = useState(false);
  const activeSlug = useWorkspaceStore((s) => s.activeSlug);
  const caps = useWorkspaceCapabilities(activeSlug ?? "");

  const onOpenHelp = useCallback(() => setHelpOpen((v) => !v), []);
  const onOpenCreateTask = useCallback(() => {
    if (!caps.canCreateTask) return;
    const input = document.getElementById(
      "task-title",
    ) as HTMLInputElement | null;
    if (input) {
      input.focus();
      input.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [caps.canCreateTask]);

  useKeyboardShortcuts({ onOpenHelp, onOpenCreateTask });

  useEffect(() => {
    if (!helpOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setHelpOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [helpOpen]);

  if (!helpOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close shortcuts help"
        onClick={() => setHelpOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Keyboard shortcuts</h2>
          <button
            type="button"
            className="text-xs text-slate-400 hover:text-slate-600"
            onClick={() => setHelpOpen(false)}
          >
            Esc
          </button>
        </div>
        <ul className="space-y-2">
          {SHORTCUT_HELP.map((row) => (
            <li
              key={row.keys}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-slate-600 dark:text-zinc-300">
                {row.description}
              </span>
              <kbd className="shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-500 dark:border-zinc-700 dark:bg-zinc-900">
                {row.keys}
              </kbd>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-slate-400">
          Shortcuts are ignored while typing in fields.
        </p>
      </div>
    </div>
  );
}
