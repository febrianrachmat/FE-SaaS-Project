import { EmptyState } from "@/shared/ui/empty-state";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Workspace overview will appear here after authentication (Milestone 1).
        </p>
      </div>
      <EmptyState
        icon={<LayoutDashboard className="h-10 w-10" />}
        title="Your workspace is ready"
        description="Complete auth in Milestone 1 to see assigned tasks, deadlines, and activity."
      />
    </div>
  );
}
