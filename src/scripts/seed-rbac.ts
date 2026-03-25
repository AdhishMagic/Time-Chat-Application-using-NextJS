import { connectDB } from '@/lib/db';
import Role from '@/models/Role';
import Permission from '@/models/Permission';
import RolePermission from '@/models/RolePermission';

const PERMISSIONS = {
  MESSAGE_CREATE: 'message:create',
  MESSAGE_EDIT: 'message:edit',
  MESSAGE_DELETE: 'message:delete',
  CONVERSATION_READ: 'conversation:read',
  CONVERSATION_DELETE: 'conversation:delete',
  USER_MANAGE: 'user:manage',
};

const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.USER]: [
    PERMISSIONS.MESSAGE_CREATE,
    PERMISSIONS.MESSAGE_EDIT,
    PERMISSIONS.MESSAGE_DELETE,
    PERMISSIONS.CONVERSATION_READ,
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.MESSAGE_CREATE,
    PERMISSIONS.MESSAGE_EDIT,
    PERMISSIONS.MESSAGE_DELETE,
    PERMISSIONS.CONVERSATION_READ,
    PERMISSIONS.CONVERSATION_DELETE,
  ],
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
};

async function seed() {
  try {
    await connectDB();

    for (const [key, action] of Object.entries(PERMISSIONS)) {
      await Permission.findOneAndUpdate(
        { action },
        { action },
        { upsert: true, new: true }
      );
    }

    for (const roleName of Object.values(ROLES)) {
      await Role.findOneAndUpdate(
        { name: roleName },
        { name: roleName },
        { upsert: true, new: true }
      );
    }

    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      const role = await Role.findOne({ name: roleName });
      if (!role) continue;

      await RolePermission.deleteMany({ roleId: role._id });

      for (const permissionAction of permissions) {
        const permission = await Permission.findOne({ action: permissionAction });
        if (!permission) continue;

        await RolePermission.findOneAndUpdate(
          { roleId: role._id, permissionId: permission._id },
          { roleId: role._id, permissionId: permission._id },
          { upsert: true }
        );
      }
    }

    console.log('✅ RBAC seed complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
