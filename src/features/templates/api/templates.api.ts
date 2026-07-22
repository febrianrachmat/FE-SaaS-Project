import { apiClient } from "@/shared/lib/api-client";
import type {
  AppliedProject,
  ApplyTemplateInput,
  CreateTemplateFromProjectInput,
  ProjectTemplate,
} from "../types";

export const templatesApi = {
  list: (workspaceSlug: string) =>
    apiClient<ProjectTemplate[]>(`/workspaces/${workspaceSlug}/templates`),

  get: (workspaceSlug: string, templateId: string) =>
    apiClient<ProjectTemplate>(
      `/workspaces/${workspaceSlug}/templates/${templateId}`,
    ),

  createFromProject: (
    workspaceSlug: string,
    payload: CreateTemplateFromProjectInput,
  ) =>
    apiClient<ProjectTemplate>(
      `/workspaces/${workspaceSlug}/templates/from-project`,
      { method: "POST", body: payload },
    ),

  apply: (
    workspaceSlug: string,
    templateId: string,
    payload: ApplyTemplateInput = {},
  ) =>
    apiClient<AppliedProject>(
      `/workspaces/${workspaceSlug}/templates/${templateId}/apply`,
      { method: "POST", body: payload },
    ),

  remove: (workspaceSlug: string, templateId: string) =>
    apiClient<{ message: string }>(
      `/workspaces/${workspaceSlug}/templates/${templateId}`,
      { method: "DELETE" },
    ),
};
