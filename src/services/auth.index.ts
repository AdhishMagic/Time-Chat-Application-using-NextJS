/**
 * Central export file for all permission service utilities
 * Usage: import { hasPermission, isAdmin } from '@/services/permission.service';
 */

export {
  getUserPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserRole,
  isAdmin,
  assignRoleToUser,
  clearUserPermissionCache,
} from './permission.service';
