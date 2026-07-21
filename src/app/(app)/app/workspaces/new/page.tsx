import { CreateWorkspaceForm } from "@/features/workspace";

export const metadata = { title: "New workspace" };

export default function NewWorkspacePage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Create workspace
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Workspaces group your projects, members, and settings.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <CreateWorkspaceForm />
      </div>
    </div>
  );
}
