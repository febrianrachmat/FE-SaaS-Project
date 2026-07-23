import { apiClient } from "@/shared/lib/api-client";
import type {
  ApiKey,
  CreateApiKeyInput,
  CreatedApiKey,
  CreateWebhookInput,
  UpdateWebhookInput,
  Webhook,
  WebhookDelivery,
} from "../types";

export const integrationsApi = {
  listWebhooks: (workspaceSlug: string) =>
    apiClient<Webhook[]>(`/workspaces/${workspaceSlug}/webhooks`),

  createWebhook: (workspaceSlug: string, payload: CreateWebhookInput) =>
    apiClient<Webhook>(`/workspaces/${workspaceSlug}/webhooks`, {
      method: "POST",
      body: payload,
    }),

  updateWebhook: (
    workspaceSlug: string,
    webhookId: string,
    payload: UpdateWebhookInput,
  ) =>
    apiClient<Webhook>(
      `/workspaces/${workspaceSlug}/webhooks/${webhookId}`,
      { method: "PATCH", body: payload },
    ),

  removeWebhook: (workspaceSlug: string, webhookId: string) =>
    apiClient<{ message: string }>(
      `/workspaces/${workspaceSlug}/webhooks/${webhookId}`,
      { method: "DELETE" },
    ),

  listWebhookDeliveries: (workspaceSlug: string, webhookId: string) =>
    apiClient<WebhookDelivery[]>(
      `/workspaces/${workspaceSlug}/webhooks/${webhookId}/deliveries`,
    ),

  retryWebhookDelivery: (
    workspaceSlug: string,
    webhookId: string,
    deliveryId: string,
  ) =>
    apiClient<{ message: string }>(
      `/workspaces/${workspaceSlug}/webhooks/${webhookId}/deliveries/${deliveryId}/retry`,
      { method: "POST" },
    ),

  listApiKeys: (workspaceSlug: string) =>
    apiClient<ApiKey[]>(`/workspaces/${workspaceSlug}/api-keys`),

  createApiKey: (workspaceSlug: string, payload: CreateApiKeyInput) =>
    apiClient<CreatedApiKey>(`/workspaces/${workspaceSlug}/api-keys`, {
      method: "POST",
      body: payload,
    }),

  revokeApiKey: (workspaceSlug: string, apiKeyId: string) =>
    apiClient<ApiKey>(
      `/workspaces/${workspaceSlug}/api-keys/${apiKeyId}/revoke`,
      { method: "POST" },
    ),

  rotateApiKey: (workspaceSlug: string, apiKeyId: string) =>
    apiClient<CreatedApiKey>(
      `/workspaces/${workspaceSlug}/api-keys/${apiKeyId}/rotate`,
      { method: "POST" },
    ),
};
