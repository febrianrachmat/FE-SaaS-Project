"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  Search,
  Bell,
  Settings,
  PanelLeftClose,
  PanelLeft,
  LogOut,
} from "lucide-react";
import { useUiStore } from "@/shared/stores/ui-store";
import { cn } from "@/shared/lib/utils";
import { APP_NAME } from "@/config/env";
import { Button } from "@/shared/ui/button";
import { useAuthStore, useLogout } from "@/features/auth";
import { WorkspaceSwitcher } from "@/features/workspace";

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/projects", label: "Projects", icon: FolderKanban },
  { href: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/app/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const logout = useLogout();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-200 dark:border-zinc-800 dark:bg-zinc-950",
        sidebarCollapsed ? "w-[72px]" : "w-60",
      )}
    >
      <div className="flex h-14 items-center justify-between px-3">
        {!sidebarCollapsed ? (
          <Link
            href="/app"
            className="text-base font-semibold tracking-tight text-primary-600"
          >
            {APP_NAME}
          </Link>
        ) : (
          <span className="mx-auto text-sm font-bold text-primary-600">FP</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(sidebarCollapsed && "hidden")}
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {sidebarCollapsed ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Expand sidebar"
          className="mx-auto mb-2"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      ) : null}

      <WorkspaceSwitcher />

      <nav className="flex flex-1 flex-col gap-1 px-2 py-2" aria-label="Main">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
              sidebarCollapsed && "justify-center px-0",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {!sidebarCollapsed ? <span>{label}</span> : null}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-2 dark:border-zinc-800">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-slate-600 dark:text-zinc-400",
            sidebarCollapsed && "justify-center px-0",
          )}
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed ? (
            <span>{logout.isPending ? "Signing out…" : "Sign out"}</span>
          ) : null}
        </Button>
      </div>
    </aside>
  );
}

export function AppTopbar() {
  const user = useAuthStore((s) => s.user);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 dark:border-zinc-800 dark:bg-zinc-900">
        <Search className="h-4 w-4" aria-hidden />
        <span>Search…</span>
        <kbd className="ml-8 hidden rounded border border-slate-200 px-1.5 text-[10px] dark:border-zinc-700 sm:inline">
          ⌘K
        </kbd>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <div
          className="h-8 w-8 rounded-full bg-primary-100 text-center text-xs leading-8 font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-200"
          title={user?.email}
          aria-label={user?.name ?? "User"}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
