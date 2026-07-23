import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional()
    .or(z.literal("")),
  description: z.string().max(2000).optional(),
  icon: z.string().max(16).optional(),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"])
    .optional(),
  visibility: z.enum(["PRIVATE", "WORKSPACE"]).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(2000).optional().or(z.literal("")),
  icon: z.string().max(16).optional().or(z.literal("")),
  coverUrl: z
    .string()
    .url()
    .max(2048)
    .optional()
    .or(z.literal(""))
    .or(z.null()),
  visibility: z.enum(["PRIVATE", "WORKSPACE"]),
  status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"]),
  deadline: z.string().optional().or(z.literal("")),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(20000).optional(),
  status: z
    .enum([
      "BACKLOG",
      "TODO",
      "IN_PROGRESS",
      "REVIEW",
      "TESTING",
      "DONE",
      "CANCELED",
    ])
    .optional(),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"])
    .optional(),
  dueDate: z.string().optional().or(z.literal("")),
  assigneeId: z.string().uuid().optional().or(z.literal("")),
  parentId: z.string().uuid().optional().or(z.literal("")),
  // Keep as form-friendly unions (HTML number inputs are strings).
  storyPoints: z.union([z.literal(""), z.string(), z.number()]).optional(),
  estimatedMins: z.union([z.literal(""), z.string(), z.number()]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
/** API payload sent to createTask. */
export type CreateTaskInput = {
  title: string;
  description?: string;
  status?:
    | "BACKLOG"
    | "TODO"
    | "IN_PROGRESS"
    | "REVIEW"
    | "TESTING"
    | "DONE"
    | "CANCELED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
  dueDate?: string;
  assigneeId?: string;
  parentId?: string;
  storyPoints?: number;
  estimatedMins?: number;
};

function toOptionalInt(
  value: string | number | "" | undefined,
  max?: number,
): number | undefined {
  if (value === undefined || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n) || n < 0) return undefined;
  if (max !== undefined && n > max) return undefined;
  return n;
}

export function toCreateTaskPayload(
  values: CreateTaskFormValues,
): CreateTaskInput {
  return {
    title: values.title,
    ...(values.description ? { description: values.description } : {}),
    ...(values.status ? { status: values.status } : {}),
    ...(values.priority ? { priority: values.priority } : {}),
    ...(values.dueDate ? { dueDate: values.dueDate } : {}),
    ...(values.assigneeId ? { assigneeId: values.assigneeId } : {}),
    ...(values.parentId ? { parentId: values.parentId } : {}),
    ...(toOptionalInt(values.storyPoints, 100) !== undefined
      ? { storyPoints: toOptionalInt(values.storyPoints, 100) }
      : {}),
    ...(toOptionalInt(values.estimatedMins) !== undefined
      ? { estimatedMins: toOptionalInt(values.estimatedMins) }
      : {}),
  };
}
