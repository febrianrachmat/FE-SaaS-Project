import type { WorkspaceRole } from "@/shared/types/domain";

/** Mirrors BE `ROLE_PERMISSIONS` — keep in sync with `BE/src/common/constants/rbac.ts`. */
export const PERMISSIONS = {
  WORKSPACE_VIEW: "workspace:view",
  WORKSPACE_UPDATE: "workspace:update",
  WORKSPACE_DELETE: "workspace:delete",
  WORKSPACE_TRANSFER: "workspace:transfer",
  WORKSPACE_ARCHIVE: "workspace:archive",
  MEMBER_INVITE: "member:invite",
  MEMBER_REMOVE: "member:remove",
  MEMBER_ROLE_CHANGE: "member:role_change",
  PROJECT_CREATE: "project:create",
  PROJECT_UPDATE: "project:update",
  PROJECT_DELETE: "project:delete",
  PROJECT_ARCHIVE: "project:archive",
  TASK_CREATE: "task:create",
  TASK_UPDATE: "task:update",
  TASK_DELETE: "task:delete",
  TASK_ASSIGN: "task:assign",
  COMMENT_CREATE: "comment:create",
  COMMENT_DELETE: "comment:delete",
  FILE_UPLOAD: "file:upload",
  FILE_DELETE: "file:delete",
  SETTINGS_MANAGE: "settings:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<WorkspaceRole, readonly Permission[]> = {
  GUEST: [PERMISSIONS.WORKSPACE_VIEW],
  MEMBER: [
    PERMISSIONS.WORKSPACE_VIEW,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.FILE_UPLOAD,
  ],
  PROJECT_MANAGER: [
    PERMISSIONS.WORKSPACE_VIEW,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_ARCHIVE,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_DELETE,
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.FILE_DELETE,
  ],
  ADMIN: [
    PERMISSIONS.WORKSPACE_VIEW,
    PERMISSIONS.WORKSPACE_UPDATE,
    PERMISSIONS.WORKSPACE_ARCHIVE,
    PERMISSIONS.MEMBER_INVITE,
    PERMISSIONS.MEMBER_REMOVE,
    PERMISSIONS.MEMBER_ROLE_CHANGE,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.PROJECT_ARCHIVE,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_DELETE,
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.FILE_DELETE,
    PERMISSIONS.SETTINGS_MANAGE,
  ],
  OWNER: Object.values(PERMISSIONS),
};

export function roleHasPermission(
  role: WorkspaceRole | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export type WorkspaceCapabilities = {
  role: WorkspaceRole | null;
  isGuest: boolean;
  /** True when the role can only view (GUEST). */
  isViewOnly: boolean;
  can: (permission: Permission) => boolean;
  canInvite: boolean;
  canManageMembers: boolean;
  canManageSettings: boolean;
  canCreateProject: boolean;
  canUpdateProject: boolean;
  canDeleteProject: boolean;
  canArchiveProject: boolean;
  canCreateTask: boolean;
  canUpdateTask: boolean;
  canDeleteTask: boolean;
  canComment: boolean;
  canUploadFile: boolean;
  canDeleteFile: boolean;
};

export function capabilitiesForRole(
  role: WorkspaceRole | null | undefined,
): WorkspaceCapabilities {
  const can = (permission: Permission) => roleHasPermission(role, permission);
  return {
    role: role ?? null,
    isGuest: role === "GUEST",
    isViewOnly: role === "GUEST",
    can,
    canInvite: can(PERMISSIONS.MEMBER_INVITE),
    canManageMembers: can(PERMISSIONS.MEMBER_ROLE_CHANGE),
    canManageSettings: can(PERMISSIONS.SETTINGS_MANAGE),
    canCreateProject: can(PERMISSIONS.PROJECT_CREATE),
    canUpdateProject: can(PERMISSIONS.PROJECT_UPDATE),
    canDeleteProject: can(PERMISSIONS.PROJECT_DELETE),
    canArchiveProject: can(PERMISSIONS.PROJECT_ARCHIVE),
    canCreateTask: can(PERMISSIONS.TASK_CREATE),
    canUpdateTask: can(PERMISSIONS.TASK_UPDATE),
    canDeleteTask: can(PERMISSIONS.TASK_DELETE),
    canComment: can(PERMISSIONS.COMMENT_CREATE),
    canUploadFile: can(PERMISSIONS.FILE_UPLOAD),
    canDeleteFile: can(PERMISSIONS.FILE_DELETE),
  };
}
