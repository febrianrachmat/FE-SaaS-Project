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
