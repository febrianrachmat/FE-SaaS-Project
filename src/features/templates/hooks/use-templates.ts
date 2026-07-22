"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { templatesApi } from "../api/templates.api";
import type {
  ApplyTemplateInput,
  CreateTemplateFromProjectInput,
} from "../types";

export const templateKeys = {
  list: (slug: string) => ["templates", slug] as const,
};

export function useTemplates(workspaceSlug: string) {
  return useQuery({
    queryKey: templateKeys.list(workspaceSlug),
    queryFn: () => templatesApi.list(workspaceSlug),
    enabled: !!workspaceSlug,
  });
}

export function useCreateTemplateFromProject(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTemplateFromProjectInput) =>
      templatesApi.createFromProject(workspaceSlug, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: templateKeys.list(workspaceSlug),
      });
    },
  });
}

export function useApplyTemplate(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      ...payload
    }: ApplyTemplateInput & { templateId: string }) =>
      templatesApi.apply(workspaceSlug, templateId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["projects", workspaceSlug],
      });
    },
  });
}

export function useDeleteTemplate(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      templatesApi.remove(workspaceSlug, templateId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: templateKeys.list(workspaceSlug),
      });
    },
  });
}
