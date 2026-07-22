"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { integrationsApi } from "../api/integrations.api";
import type {
  CreateApiKeyInput,
  CreateWebhookInput,
  UpdateWebhookInput,
} from "../types";

export const integrationKeys = {
  webhooks: (slug: string) => ["webhooks", slug] as const,
  apiKeys: (slug: string) => ["api-keys", slug] as const,
};

export function useWebhooks(workspaceSlug: string, enabled = true) {
  return useQuery({
    queryKey: integrationKeys.webhooks(workspaceSlug),
    queryFn: () => integrationsApi.listWebhooks(workspaceSlug),
    enabled: !!workspaceSlug && enabled,
  });
}

export function useCreateWebhook(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWebhookInput) =>
      integrationsApi.createWebhook(workspaceSlug, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: integrationKeys.webhooks(workspaceSlug),
      });
    },
  });
}

export function useUpdateWebhook(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      webhookId,
      ...payload
    }: UpdateWebhookInput & { webhookId: string }) =>
      integrationsApi.updateWebhook(workspaceSlug, webhookId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: integrationKeys.webhooks(workspaceSlug),
      });
    },
  });
}

export function useDeleteWebhook(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (webhookId: string) =>
      integrationsApi.removeWebhook(workspaceSlug, webhookId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: integrationKeys.webhooks(workspaceSlug),
      });
    },
  });
}

export function useApiKeys(workspaceSlug: string, enabled = true) {
  return useQuery({
    queryKey: integrationKeys.apiKeys(workspaceSlug),
    queryFn: () => integrationsApi.listApiKeys(workspaceSlug),
    enabled: !!workspaceSlug && enabled,
  });
}

export function useCreateApiKey(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateApiKeyInput) =>
      integrationsApi.createApiKey(workspaceSlug, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: integrationKeys.apiKeys(workspaceSlug),
      });
    },
  });
}

export function useRevokeApiKey(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (apiKeyId: string) =>
      integrationsApi.revokeApiKey(workspaceSlug, apiKeyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: integrationKeys.apiKeys(workspaceSlug),
      });
    },
  });
}
