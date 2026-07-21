import { apiClient } from "@/shared/lib/api-client";
import type {
  CreateWorkspaceInput,
  InviteMemberInput,
  UpdateWorkspaceInput,
} from "../schemas/workspace.schema";
import type { Workspace, WorkspaceMember } from "../types";

export const workspaceApi = {
  list: () => apiClient<Workspace[]>("/workspaces"),

  create: (payload: CreateWorkspaceInput) =>
    apiClient<Workspace>("/workspaces", {
      method: "POST",
      body: {
        name: payload.name,
        ...(payload.slug ? { slug: payload.slug } : {}),
        ...(payload.description ? { description: payload.description } : {}),
        ...(payload.timezone ? { timezone: payload.timezone } : {}),
      },
    }),

  get: (slug: string) => apiClient<Workspace>(`/workspaces/${slug}`),

  update: (slug: string, payload: UpdateWorkspaceInput) =>
    apiClient<Workspace>(`/workspaces/${slug}`, {
      method: "PATCH",
      body: payload,
    }),

  archive: (slug: string) =>
    apiClient<Workspace>(`/workspaces/${slug}/archive`, { method: "POST" }),

  listMembers: (slug: string) =>
    apiClient<WorkspaceMember[]>(`/workspaces/${slug}/members`),

  invite: (slug: string, payload: InviteMemberInput) =>
    apiClient<{ message: string; email: string }>(
      `/workspaces/${slug}/invitations`,
      { method: "POST", body: payload },
    ),

  removeMember: (slug: string, memberId: string) =>
    apiClient<{ message: string }>(`/workspaces/${slug}/members/${memberId}`, {
      method: "DELETE",
    }),

  acceptInvitation: (token: string) =>
    apiClient<{ workspace: Workspace; message: string }>(
      "/invitations/accept",
      { method: "POST", body: { token } },
    ),
};
