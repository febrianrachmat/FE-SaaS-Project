"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  Users,
} from "lucide-react";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { useDashboard } from "../hooks/use-dashboard";

type Props = {
  workspaceSlug: string;
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  hint?: string;
  icon: typeof Users;
  tone?: "default" | "danger" | "success";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
          {label}
        </p>
        <Icon
          className={cn(
            "h-4 w-4",
            tone === "danger" && "text-danger-600",
            tone === "success" && "text-success-600",
            tone === "default" && "text-primary-600",
          )}
        />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function formatAction(action: string) {
  return action.toLowerCase().replaceAll("_", " ");
}

export function WorkspaceDashboard({ workspaceSlug }: Props) {
  const { data, isLoading, isError } = useDashboard(workspaceSlug);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-danger-600">Unable to load dashboard analytics.</p>
    );
  }

  const completionRate =
    data.stats.tasks === 0
      ? 0
      : Math.round((data.stats.completedTasks / data.stats.tasks) * 100);

  const weeklyChart = data.weeklyCompletion.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "EEE"),
  }));

  const statusChart = data.tasksByStatus.map((s) => ({
    name: s.status.replaceAll("_", " "),
    count: s.count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Projects"
          value={data.stats.projects}
          hint={`${data.stats.activeProjects} active`}
          icon={FolderKanban}
        />
        <StatCard
          label="Tasks"
          value={data.stats.tasks}
          hint={`${completionRate}% completed`}
          icon={ListTodo}
        />
        <StatCard
          label="Completed"
          value={data.stats.completedTasks}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Members"
          value={data.stats.members}
          icon={Users}
        />
        <StatCard
          label="Overdue"
          value={data.stats.overdueTasks}
          icon={AlertTriangle}
          tone={data.stats.overdueTasks > 0 ? "danger" : "default"}
        />
        <StatCard
          label="Done this week"
          value={data.weeklyCompletion.reduce((n, d) => n + d.completed, 0)}
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
            Weekly productivity
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Created vs completed (last 7 days)
          </p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
            Tasks by status
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">Distribution across board</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold">Project progress</h3>
          <ul className="mt-3 space-y-3">
            {data.projectProgress.length === 0 ? (
              <li className="text-sm text-slate-400">No projects yet.</li>
            ) : (
              data.projectProgress.map((p) => (
                <li key={p.id}>
                  <div className="flex items-center justify-between text-sm">
                    <Link
                      href={`/app/w/${workspaceSlug}/projects/${p.slug}`}
                      className="font-medium hover:text-primary-600"
                    >
                      {p.icon ?? "📁"} {p.name}
                    </Link>
                    <span className="text-xs text-slate-400">
                      {p.doneTasks}/{p.totalTasks} · {p.progress}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold">Member activity (7d)</h3>
          <ul className="mt-3 space-y-2">
            {data.memberActivity.length === 0 ? (
              <li className="text-sm text-slate-400">No activity yet.</li>
            ) : (
              data.memberActivity.map((m) => (
                <li
                  key={m.userId}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{m.name}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                    {m.actions} actions
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold">Assigned to me</h3>
          <ul className="mt-3 space-y-2">
            {data.assignedToMe.length === 0 ? (
              <li className="text-sm text-slate-400">Nothing assigned.</li>
            ) : (
              data.assignedToMe.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/app/w/${workspaceSlug}/projects/${t.project.slug}`}
                    className="block rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-900"
                  >
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {t.project.name} · {t.status.replaceAll("_", " ")}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold">Upcoming deadlines</h3>
          <ul className="mt-3 space-y-2">
            {data.upcomingDeadlines.length === 0 ? (
              <li className="text-sm text-slate-400">No deadlines in 14 days.</li>
            ) : (
              data.upcomingDeadlines.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/app/w/${workspaceSlug}/projects/${t.project.slug}`}
                    className="block rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-900"
                  >
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {format(parseISO(t.dueDate), "MMM d")} · {t.project.name}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold">Recent activity</h3>
          <ul className="mt-3 space-y-2">
            {data.recentActivity.length === 0 ? (
              <li className="text-sm text-slate-400">No recent events.</li>
            ) : (
              data.recentActivity.map((a) => (
                <li key={a.id} className="text-sm">
                  <p>
                    <span className="font-medium">{a.actor.name}</span>{" "}
                    <span className="text-slate-500">
                      {formatAction(a.action)}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {format(parseISO(a.createdAt), "MMM d, HH:mm")}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
