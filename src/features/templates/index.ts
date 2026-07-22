export { templatesApi } from "./api/templates.api";
export { TemplatesPanel } from "./components/templates-panel";
export {
  useTemplates,
  useCreateTemplateFromProject,
  useApplyTemplate,
  useDeleteTemplate,
  templateKeys,
} from "./hooks/use-templates";
export type {
  ProjectTemplate,
  TemplatePayload,
  TemplateTask,
  CreateTemplateFromProjectInput,
  ApplyTemplateInput,
  AppliedProject,
} from "./types";
