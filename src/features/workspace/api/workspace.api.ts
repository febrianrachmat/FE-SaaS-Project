import { apiClient } from "@/shared/lib/api-client";
import type {
  CreateWorkspaceInput,
  InviteMemberInput,
  UpdateWorkspaceInput,
} from "../schemas/workspace.schema";
import type {
  InvitationPreview,
  InviteResult,
  PendingInvitation,
  Workspace,
  WorkspaceMember,
} from "../types";

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

  listInvitations: (slug: string) =>
    apiClient<PendingInvitation[]>(`/workspaces/${slug}/invitations`),

  invite: (slug: string, payload: InviteMemberInput) =>
    apiClient<InviteResult>(`/workspaces/${slug}/invitations`, {
      method: "POST",
      body: payload,
    }),

  resendInvitation: (slug: string, invitationId: string) =>
    apiClient<{
      message: string;
      email: string;
      inviteLink: string;
      expiresAt: string;
    }>(`/workspaces/${slug}/invitations/${invitationId}/resend`, {
      method: "POST",
    }),

  revokeInvitation: (slug: string, invitationId: string) =>
    apiClient<{ message: string }>(
      `/workspaces/${slug}/invitations/${invitationId}`,
      { method: "DELETE" },
    ),

  removeMember: (slug: string, memberId: string) =>
    apiClient<{ message: string }>(`/workspaces/${slug}/members/${memberId}`, {
      method: "DELETE",
    }),

  previewInvitation: (token: string) =>
    apiClient<InvitationPreview>(
      `/invitations/preview?token=${encodeURIComponent(token)}`,
    ),

  acceptInvitation: (token: string) =>
    apiClient<{ workspace: Workspace; message: string }>(
      "/invitations/accept",
      { method: "POST", body: { token } },
    ),
};
