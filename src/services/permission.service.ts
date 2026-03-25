import User from '@/models/User';
import Role from '@/models/Role';
import Permission from '@/models/Permission';
import RolePermission from '@/models/RolePermission';
import { connectDB } from '@/lib/db';

const permissionCache = new Map<string, Set<string>>();
const CACHE_TTL = 5 * 60 * 1000;
const cacheTimestamps = new Map<string, number>();

export function clearCache(userId: string) {
  permissionCache.delete(userId);
  cacheTimestamps.delete(userId);
}

export async function getPermissions(userId: string): Promise<Set<string>> {
  const cached = permissionCache.get(userId);
  const timestamp = cacheTimestamps.get(userId);

  if (cached && timestamp && Date.now() - timestamp < CACHE_TTL) {
    return cached;
  }

  await connectDB();

  const user = await User.findById(userId).select('roleId');
  if (!user?.roleId) {
    return new Set<string>();
  }

  const rolePermissions = await RolePermission.find({ roleId: user.roleId }).populate(
    'permissionId'
  );

  const permissions = new Set(
    rolePermissions
      .map((rp: any) => rp.permissionId?.action)
      .filter((action: any): action is string => action != null)
  );

  permissionCache.set(userId, permissions);
  cacheTimestamps.set(userId, Date.now());

  return permissions;
}

export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const perms = await getPermissions(userId);
  return perms.has(permission);
}

export async function hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
  const perms = await getPermissions(userId);
  return permissions.some((p) => perms.has(p));
}

export async function isAdmin(userId: string): Promise<boolean> {
  await connectDB();
  const user = await User.findById(userId).select('roleId').populate('roleId');
  return (user?.roleId as any)?.name === 'admin';
}
