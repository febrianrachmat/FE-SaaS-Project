export function formatActivityAction(action: string): string {
  const labels: Record<string, string> = {
    TASK_CREATED: "created",
    TASK_UPDATED: "updated",
    TASK_DELETED: "deleted",
    TASK_STATUS_CHANGED: "moved",
    TASK_ASSIGNED: "assigned",
    COMMENT_ADDED: "commented on",
    COMMENT_DELETED: "removed a comment from",
    MEMBER_JOINED: "joined the workspace",
    MEMBER_LEFT: "left the workspace",
    ROLE_CHANGED: "changed a member role",
    PROJECT_CREATED: "created project",
    PROJECT_UPDATED: "updated project",
    PROJECT_ARCHIVED: "archived project",
    WORKSPACE_CREATED: "created the workspace",
    WORKSPACE_UPDATED: "updated the workspace",
    INVITATION_SENT: "invited",
    FILE_UPLOADED: "uploaded a file to",
    FILE_DELETED: "removed a file from",
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
