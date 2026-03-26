import { PERMISSIONS } from "./permissions";

/**
 * Role definitions for the application
 */
export const ROLES = {
  USER: "user",
  MODERATOR: "moderator",
  ADMIN: "admin",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/**
 * Default role permissions mapping
 * This defines what permissions each role gets by default
 *
 * In production, these should be stored in the database,
 * but this serves as a reference and seed data template.
 */
export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  // Regular user - can only manage their own messages/conversations
  [ROLES.USER]: [
    PERMISSIONS.MESSAGE_CREATE,
    PERMISSIONS.MESSAGE_READ,
    PERMISSIONS.MESSAGE_EDIT,
    PERMISSIONS.MESSAGE_DELETE,
    PERMISSIONS.CONVERSATION_READ,
    PERMISSIONS.CONVERSATION_CREATE,
    PERMISSIONS.CONVERSATION_EDIT,
    PERMISSIONS.USER_READ,
  ],

  // Moderator - can manage all messages/conversations
  [ROLES.MODERATOR]: [
    PERMISSIONS.MESSAGE_CREATE,
    PERMISSIONS.MESSAGE_READ,
    PERMISSIONS.MESSAGE_EDIT,
    PERMISSIONS.MESSAGE_DELETE,
    PERMISSIONS.CONVERSATION_READ,
    PERMISSIONS.CONVERSATION_CREATE,
    PERMISSIONS.CONVERSATION_EDIT,
    PERMISSIONS.CONVERSATION_DELETE,
    PERMISSIONS.USER_READ,
  ],

  // Admin - full access
  [ROLES.ADMIN]: [
    PERMISSIONS.MESSAGE_CREATE,
    PERMISSIONS.MESSAGE_READ,
    PERMISSIONS.MESSAGE_EDIT,
    PERMISSIONS.MESSAGE_DELETE,
    PERMISSIONS.CONVERSATION_READ,
    PERMISSIONS.CONVERSATION_CREATE,
    PERMISSIONS.CONVERSATION_EDIT,
    PERMISSIONS.CONVERSATION_DELETE,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.SYSTEM_CONFIG,
  ],
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  [ROLES.USER]: "Regular user with basic permissions",
  [ROLES.MODERATOR]: "Moderator with expanded permissions",
  [ROLES.ADMIN]: "Administrator with full access",
};
