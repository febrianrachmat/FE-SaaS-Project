export type Webhook = {
  id: string;
  workspaceId: string;
  url: string;
  hasSecret: boolean;
  events: string[];
  isActive: boolean;
  createdById: string;
  lastFiredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateWebhookInput = {
  url: string;
  secret?: string;
  events: string[];
};

export type UpdateWebhookInput = {
  url?: string;
  secret?: string | null;
  events?: string[];
  isActive?: boolean;
};

export type ApiKey = {
  id: string;
  workspaceId: string;
  name: string;
  keyPrefix: string;
  createdById: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type CreatedApiKey = ApiKey & {
  key: string;
};

export type CreateApiKeyInput = {
  name: string;
};

export const WEBHOOK_EVENT_OPTIONS = [
  { value: "task.assigned", label: "Task assigned" },
  { value: "task.updated", label: "Task updated" },
  { value: "comment.added", label: "Comment added" },
  { value: "mention", label: "Mention" },
  { value: "task.completed", label: "Task completed" },
  { value: "task.due_soon", label: "Due soon" },
] as const;
