import type { WorkspaceRole } from "@/shared/types/domain";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  timezone: string;
  ownerId: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  role?: WorkspaceRole;
  memberCount?: number;
};

export type WorkspaceMember = {
  id: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
};

export type PendingInvitation = {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
  invitedBy: { id: string; name: string; email: string } | null;
};

export type InviteResult = {
  message: string;
  email: string;
  inviteLink: string;
  invitationId: string;
  role: string;
  expiresAt: string;
};

export type InvitationPreview = {
  email: string;
  role: string;
  expiresAt: string;
  workspace: { name: string; slug: string };
};
