import type { ReactNode } from "react";
import { RequireAuth } from "@/features/auth";
import { AppSidebar, AppTopbar } from "@/shared/components/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950">
        <a
          href="#main-content"
          className="absolute left-4 top-4 z-50 -translate-y-[200%] rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Skip to content
        </a>
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-y-auto p-6 outline-none"
          >
            {children}
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
