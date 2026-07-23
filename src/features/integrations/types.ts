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

export type WebhookDelivery = {
  id: string;
  webhookId: string;
  event: string;
  success: boolean;
  statusCode: number | null;
  attempt: number;
  responseSnippet: string | null;
  createdAt: string;
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
  scopes: string[];
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
  scopes?: string[];
};

export const WEBHOOK_EVENT_OPTIONS = [
  { value: "task.assigned", label: "Task assigned" },
  { value: "task.updated", label: "Task updated" },
  { value: "comment.added", label: "Comment added" },
  { value: "mention", label: "Mention" },
  { value: "task.completed", label: "Task completed" },
  { value: "task.due_soon", label: "Due soon" },
] as const;

/** Common scopes for API key UI (subset of BE PERMISSIONS). */
export const API_KEY_SCOPE_OPTIONS = [
  { value: "workspace:view", label: "View workspace" },
  { value: "project:create", label: "Create projects" },
  { value: "project:update", label: "Update projects" },
  { value: "project:delete", label: "Delete projects" },
  { value: "task:create", label: "Create tasks" },
  { value: "task:update", label: "Update tasks" },
  { value: "task:delete", label: "Delete tasks" },
  { value: "task:assign", label: "Assign tasks" },
  { value: "comment:create", label: "Create comments" },
  { value: "file:upload", label: "Upload files" },
  { value: "settings:manage", label: "Manage settings" },
] as const;
