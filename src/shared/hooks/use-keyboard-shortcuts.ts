"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/features/workspace";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  // Allow `?` / Esc handling outside inputs even when a dialog is open via its own handlers.
  return false;
}

/**
 * Global navigation shortcuts (ignored while typing in inputs/dialogs).
 * Chord: press `g` then a letter within 1s.
 */
export function useKeyboardShortcuts(options?: {
  onOpenHelp?: () => void;
  onOpenCreateTask?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const activeSlug = useWorkspaceStore((s) => s.activeSlug);
  const pendingG = useRef(false);
  const clearTimer = useRef<number | null>(null);
  const onOpenHelp = options?.onOpenHelp;
  const onOpenCreateTask = options?.onOpenCreateTask;

  useEffect(() => {
    function clearPending() {
      pendingG.current = false;
      if (clearTimer.current) {
        window.clearTimeout(clearTimer.current);
        clearTimer.current = null;
      }
    }

    function go(path: string) {
      clearPending();
      router.push(path);
    }

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      const key = e.key.toLowerCase();

      if (key === "?" || (e.shiftKey && key === "/")) {
        e.preventDefault();
        onOpenHelp?.();
        return;
      }

      if (pendingG.current) {
        e.preventDefault();
        const base = activeSlug ? `/app/w/${activeSlug}` : "/app";
        if (key === "d") go(base);
        else if (key === "p") go(`${base}/projects`);
        else if (key === "m") go(activeSlug ? `${base}/my-work` : "/app");
        else if (key === "r") go(activeSlug ? `${base}/roadmap` : "/app");
        else if (key === "c") go(activeSlug ? `${base}/cycles` : "/app");
        else if (key === "a") go(activeSlug ? `${base}/activity` : "/app");
        else if (key === "i") go(activeSlug ? `${base}/integrations` : "/app");
        else if (key === "s") go(activeSlug ? `${base}/settings` : "/app/settings");
        else clearPending();
        return;
      }

      if (key === "g") {
        e.preventDefault();
        pendingG.current = true;
        clearTimer.current = window.setTimeout(clearPending, 1000);
        return;
      }

      // `c` = focus create task on project board
      if (key === "c" && !e.shiftKey) {
        const onProject =
          pathname.includes("/projects/") &&
          !pathname.endsWith("/settings") &&
          !pathname.includes("/settings/");
        if (onProject) {
          e.preventDefault();
          onOpenCreateTask?.();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearPending();
    };
  }, [activeSlug, onOpenCreateTask, onOpenHelp, pathname, router]);
}

export const SHORTCUT_HELP = [
  { keys: "⌘K / Ctrl+K", description: "Open command palette" },
  { keys: "G then D", description: "Go to dashboard" },
  { keys: "G then P", description: "Go to projects" },
  { keys: "G then M", description: "Go to My Work" },
  { keys: "G then R", description: "Go to roadmap" },
  { keys: "G then C", description: "Go to cycles" },
  { keys: "G then A", description: "Go to activity" },
  { keys: "G then I", description: "Go to integrations" },
  { keys: "G then S", description: "Go to settings" },
  { keys: "C", description: "Focus create task (on project page)" },
  { keys: "?", description: "Show keyboard shortcuts" },
] as const;
