/**
 * Permission actions for the application
 * Format: "resource:action"
 */
export const PERMISSIONS = {
  // Message permissions
  MESSAGE_CREATE: "message:create",
  MESSAGE_READ: "message:read",
  MESSAGE_EDIT: "message:edit",
  MESSAGE_DELETE: "message:delete",

  // Conversation permissions
  CONVERSATION_READ: "conversation:read",
  CONVERSATION_CREATE: "conversation:create",
  CONVERSATION_EDIT: "conversation:edit",
  CONVERSATION_DELETE: "conversation:delete",

  // User management permissions
  USER_MANAGE: "user:manage",
  USER_READ: "user:read",
  USER_EDIT: "user:edit",
  USER_DELETE: "user:delete",

  // Admin permissions
  ADMIN_PANEL: "admin:panel",
  SYSTEM_CONFIG: "system:config",
} as const;

export type PermissionAction = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Fixed list of all available permission actions
 */
export const ALL_PERMISSIONS: PermissionAction[] = Object.values(PERMISSIONS);

/**
 * Permission descriptions
 */
export const PERMISSION_DESCRIPTIONS: Record<PermissionAction, string> = {
  [PERMISSIONS.MESSAGE_CREATE]: "Create new messages",
  [PERMISSIONS.MESSAGE_READ]: "Read messages",
  [PERMISSIONS.MESSAGE_EDIT]: "Edit own messages",
  [PERMISSIONS.MESSAGE_DELETE]: "Delete own messages",
  [PERMISSIONS.CONVERSATION_READ]: "Read conversations",
  [PERMISSIONS.CONVERSATION_CREATE]: "Create conversations",
  [PERMISSIONS.CONVERSATION_EDIT]: "Edit conversations",
  [PERMISSIONS.CONVERSATION_DELETE]: "Delete conversations",
  [PERMISSIONS.USER_MANAGE]: "Manage users (general)",
  [PERMISSIONS.USER_READ]: "Read user information",
  [PERMISSIONS.USER_EDIT]: "Edit users",
  [PERMISSIONS.USER_DELETE]: "Delete users",
  [PERMISSIONS.ADMIN_PANEL]: "Access admin panel",
  [PERMISSIONS.SYSTEM_CONFIG]: "Modify system configuration",
};
