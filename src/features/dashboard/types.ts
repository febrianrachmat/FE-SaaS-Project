import type { TaskStatus } from "@/shared/types/domain";

export type DashboardOverview = {
  stats: {
    projects: number;
    activeProjects: number;
    tasks: number;
    completedTasks: number;
    members: number;
    overdueTasks: number;
  };
  tasksByStatus: Array<{ status: TaskStatus; count: number }>;
  tasksByPriority: Array<{ priority: string; count: number }>;
  weeklyCompletion: Array<{
    date: string;
    completed: number;
    created: number;
  }>;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    dueDate: string;
    status: TaskStatus;
    priority: string;
    project: { name: string; slug: string; icon: string | null };
  }>;
  assignedToMe: Array<{
    id: string;
    title: string;
    status: TaskStatus;
    priority: string;
    dueDate: string | null;
    project: { name: string; slug: string; icon: string | null };
  }>;
  projectProgress: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    totalTasks: number;
    doneTasks: number;
    progress: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    createdAt: string;
    actor: { id: string; name: string; avatarUrl: string | null };
    metadata: unknown;
    project: { id: string; name: string; slug: string } | null;
    task: { id: string; title: string } | null;
  }>;
  memberActivity: Array<{
    userId: string;
    name: string;
    avatarUrl: string | null;
    actions: number;
  }>;
};

export type ActivityItem = {
  id: string;
  action: string;
  createdAt: string;
  metadata: unknown;
  actor: { id: string; name: string; avatarUrl: string | null };
  project: { id: string; name: string; slug: string } | null;
  task: { id: string; title: string } | null;
};

export type ActivityFeedResult = {
  items: ActivityItem[];
  nextCursor: string | null;
};
