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
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
