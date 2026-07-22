export type TemplateTask = {
  title: string;
  status: string;
  priority: string;
  description: string | null;
};

export type TemplatePayload = {
  project: {
    name: string;
    description: string | null;
    icon: string | null;
  };
  tasks: TemplateTask[];
};

export type ProjectTemplate = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  icon: string | null;
  payload: TemplatePayload;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
};

export type CreateTemplateFromProjectInput = {
  projectSlug: string;
  name: string;
  description?: string;
  icon?: string;
};

export type ApplyTemplateInput = {
  name?: string;
};

export type AppliedProject = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  templateId: string;
  taskCount: number;
};
