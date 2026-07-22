export function formatActivityAction(action: string): string {
  const labels: Record<string, string> = {
    TASK_CREATED: "created a task",
    TASK_UPDATED: "updated a task",
    TASK_DELETED: "deleted a task",
    TASK_STATUS_CHANGED: "changed task status",
    TASK_ASSIGNED: "assigned a task",
    COMMENT_ADDED: "commented",
    COMMENT_DELETED: "deleted a comment",
    MEMBER_JOINED: "joined the workspace",
    MEMBER_LEFT: "left the workspace",
    ROLE_CHANGED: "changed a member role",
    PROJECT_CREATED: "created a project",
    PROJECT_UPDATED: "updated a project",
    PROJECT_ARCHIVED: "archived a project",
    WORKSPACE_CREATED: "created the workspace",
    WORKSPACE_UPDATED: "updated the workspace",
    INVITATION_SENT: "sent an invitation",
    FILE_UPLOADED: "uploaded a file",
    FILE_DELETED: "deleted a file",
  };
  return labels[action] ?? action.toLowerCase().replaceAll("_", " ");
}

export function activitySubject(item: {
  metadata: unknown;
  task: { title: string } | null;
  project: { name: string } | null;
}): string | null {
  if (item.task?.title) return item.task.title;
  if (
    item.metadata &&
    typeof item.metadata === "object" &&
    "title" in item.metadata &&
    typeof (item.metadata as { title: unknown }).title === "string"
  ) {
    return (item.metadata as { title: string }).title;
  }
  if (
    item.metadata &&
    typeof item.metadata === "object" &&
    "email" in item.metadata &&
    typeof (item.metadata as { email: unknown }).email === "string"
  ) {
    return (item.metadata as { email: string }).email;
  }
  if (item.project?.name) return item.project.name;
  return null;
}
