import type { TaskStatus } from "@/shared/types/domain";

export type CycleStatus = "PLANNED" | "ACTIVE" | "COMPLETED";

export type Cycle = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: CycleStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  doneCount?: number;
  progress?: number;
};

export type CycleBoardTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: string;
  dueDate: string | null;
  project: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  };
  assignee: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
};

export type CycleBoard = Cycle & {
  tasksByStatus: Array<{ status: TaskStatus; count: number }>;
  tasks: CycleBoardTask[];
};

export type CreateCycleInput = {
  name: string;
  description?: string;
  status?: CycleStatus;
  startDate?: string;
  endDate?: string;
};

export type UpdateCycleInput = {
  name?: string;
  description?: string | null;
  status?: CycleStatus;
  startDate?: string | null;
  endDate?: string | null;
};
