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
  storyPoints: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(100)])
    .optional(),
  estimatedMins: z
    .union([z.literal(""), z.coerce.number().int().min(0)])
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
