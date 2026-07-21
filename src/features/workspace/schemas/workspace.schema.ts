import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  slug: z
    .string()
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, hyphens")
    .optional()
    .or(z.literal("")),
  description: z.string().max(500).optional(),
  timezone: z.string().max(64).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["GUEST", "MEMBER", "PROJECT_MANAGER", "ADMIN"]),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional(),
  timezone: z.string().max(64).optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
