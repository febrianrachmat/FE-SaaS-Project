"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  Activity,
  Settings,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Shield,
  ListTodo,
  Tags,
  Menu,
  X,
  Repeat,
  ChartGantt,
  LayoutTemplate,
  Plug,
  Trash2,
} from "lucide-react";
import { useUiStore } from "@/shared/stores/ui-store";
import { cn } from "@/shared/lib/utils";
import { BrandLogo } from "@/shared/components/brand-logo";
import { Button } from "@/shared/ui/button";
import { useAuthStore, useLogout } from "@/features/auth";
import { WorkspaceSwitcher, useWorkspaceStore } from "@/features/workspace";
import { GlobalSearch, NotificationsMenu } from "@/features/collab";

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "my-work", label: "My Work", icon: ListTodo, workspaceScoped: true },
  {
    href: "projects",
    label: "Projects",
    icon: FolderKanban,
    workspaceScoped: true,
  },
  { href: "cycles", label: "Cycles", icon: Repeat, workspaceScoped: true },
  { href: "labels", label: "Labels", icon: Tags, workspaceScoped: true },
  {
    href: "templates",
    label: "Templates",
    icon: LayoutTemplate,
    workspaceScoped: true,
  },
  {
    href: "integrations",
    label: "Integrations",
    icon: Plug,
    workspaceScoped: true,
  },
  {
    href: "activity",
    label: "Activity",
    icon: Activity,
    workspaceScoped: true,
  },
  {
    href: "trash",
    label: "Trash",
    icon: Trash2,
    workspaceScoped: true,
  },
  {
    href: "calendar",
    label: "Calendar",
    icon: CalendarDays,
    workspaceScoped: true,
  },
  {
    href: "roadmap",
    label: "Roadmap",
    icon: ChartGantt,
    workspaceScoped: true,
  },
  { href: "/app/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE_TAB_LABELS = new Set([
  "Dashboard",
  "My Work",
  "Projects",
  "Calendar",
  "Settings",
]);

function resolveHref(
  item: (typeof NAV)[number],
  activeSlug: string | null,
): string {
  if ("workspaceScoped" in item && item.workspaceScoped) {
    return activeSlug ? `/app/w/${activeSlug}/${item.href}` : "/app";
  }
  return item.href;
}

function isActivePath(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } =
    useUiStore();
  const logout = useLogout();
  const activeSlug = useWorkspaceStore((s) => s.activeSlug);
  const user = useAuthStore((s) => s.user);
  const isSystemAdmin = user?.systemRole === "SYSTEM_ADMIN";

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen, setMobileNavOpen]);

  const navLinks = (
    <>
      {NAV.map((item) => {
        const href = resolveHref(item, activeSlug);
        const Icon = item.icon;
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={item.label}
            href={href}
            aria-label={item.label}
            title={item.label}
            aria-current={active ? "page" : undefined}
            onClick={() => setMobileNavOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
              active
                ? "bg-primary-50 text-primary-800 dark:bg-primary-950/50 dark:text-primary-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
              sidebarCollapsed && "md:justify-center md:px-0",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className={cn(sidebarCollapsed && "md:hidden")}>
              {item.label}
            </span>
          </Link>
        );
      })}
      {isSystemAdmin ? (
        <Link
          href="/app/admin"
          aria-label="Admin"
          title="Admin"
          onClick={() => setMobileNavOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
            sidebarCollapsed && "md:justify-center md:px-0",
          )}
        >
          <Shield className="h-4 w-4 shrink-0" aria-hidden />
          <span className={cn(sidebarCollapsed && "md:hidden")}>Admin</span>
        </Link>
      ) : null}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-full shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 md:flex dark:border-zinc-800 dark:bg-zinc-950",
          sidebarCollapsed ? "w-[72px]" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center px-3",
            sidebarCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {!sidebarCollapsed ? (
            <BrandLogo href="/app" height={26} />
          ) : (
            <BrandLogo href="/app" variant="icon" height={28} />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
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
          {navLinks}
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

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          mobileNavOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          aria-label="Close navigation"
          className={cn(
            "absolute inset-0 bg-slate-950/40 transition-opacity",
            mobileNavOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileNavOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-950",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
          aria-hidden={!mobileNavOpen}
        >
          <div className="flex h-14 items-center justify-between px-3">
            <BrandLogo href="/app" height={26} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <WorkspaceSwitcher />
          <nav
            className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2"
            aria-label="Main"
          >
            {navLinks}
          </nav>
          <div className="border-t border-slate-200 p-2 dark:border-zinc-800">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-600 dark:text-zinc-400"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>{logout.isPending ? "Signing out…" : "Sign out"}</span>
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const activeSlug = useWorkspaceStore((s) => s.activeSlug);
  const tabs = NAV.filter((item) => MOBILE_TAB_LABELS.has(item.label));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-stretch border-t border-slate-200 bg-white/95 backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/95"
      aria-label="Mobile"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map((item) => {
        const href = resolveHref(item, activeSlug);
        const Icon = item.icon;
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={item.label}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
              active
                ? "text-primary-700 dark:text-primary-300"
                : "text-slate-500 dark:text-zinc-400",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span>{item.label === "Dashboard" ? "Home" : item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppTopbar() {
  const user = useAuthStore((s) => s.user);
  const { toggleMobileNav } = useUiStore();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b border-slate-200 bg-white/80 px-3 backdrop-blur sm:px-4 dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={toggleMobileNav}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <GlobalSearch />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <NotificationsMenu />
        <Link
          href="/app/settings"
          className="block h-8 w-8 overflow-hidden rounded-full bg-primary-100 text-center text-xs leading-8 font-medium text-primary-700 ring-offset-2 transition hover:ring-2 hover:ring-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-primary-900 dark:text-primary-200"
          title="Account settings"
          aria-label="Account settings"
        >
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-8 w-8 object-cover"
            />
          ) : (
            initials
          )}
        </Link>
      </div>
    </header>
  );
}
