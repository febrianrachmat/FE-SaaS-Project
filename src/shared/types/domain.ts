export type WorkspaceRole =
  | "GUEST"
  | "MEMBER"
  | "PROJECT_MANAGER"
  | "ADMIN"
  | "OWNER";

export type TaskStatus =
  | "BACKLOG"
  | "TODO"
  | "IN_PROGRESS"
  | "REVIEW"
  | "TESTING"
  | "DONE"
  | "CANCELED";

export type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT"
  | "CRITICAL";

export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  timezone: string;
  locale: string;
  theme: string;
  emailVerifiedAt: string | null;
  createdAt: string;
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  timezone: string;
  archivedAt: string | null;
  createdAt: string;
};
