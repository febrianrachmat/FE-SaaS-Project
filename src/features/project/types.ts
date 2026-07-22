import type { TaskPriority, TaskStatus } from "@/shared/types/domain";

export type ProjectStatus = "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
export type ProjectPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT"
  | "CRITICAL";
export type ProjectVisibility = "PRIVATE" | "WORKSPACE";

export type Project = {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  icon: string | null;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  priority: ProjectPriority;
  deadline: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  taskCount?: number;
};

export type TaskUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type TaskLabel = {
  id: string;
  name: string;
  color: string;
};

export type TaskCycle = {
  id: string;
  name: string;
  status: string;
};

export type ChecklistItem = {
  id: string;
  title: string;
  isDone: boolean;
  position: number;
};

export type Task = {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  storyPoints: number | null;
  estimatedMins: number | null;
  actualMins: number | null;
  dueDate: string | null;
  position: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: TaskUser;
  assignee?: TaskUser | null;
  cycle?: TaskCycle | null;
  labels?: TaskLabel[];
  checklist?: ChecklistItem[];
  subtaskCount?: number;
};

export type TaskDependencyType = "BLOCKS" | "IS_BLOCKED_BY" | "RELATES_TO";

export type TaskSummary = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
};

export type TaskDependency = {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: TaskDependencyType;
  createdAt: string;
  relatedTask: TaskSummary;
};

export type TaskDependencies = {
  blocking: TaskDependency[];
  blockedBy: TaskDependency[];
  relatesTo: TaskDependency[];
};

export type RoadmapTask = Task & {
  startDate: string;
  project: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  };
};
