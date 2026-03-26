import { isAdmin } from '@/services/permission.service';

export async function checkOwnership(
  resourceOwnerId: string,
  currentUserId: string
): Promise<boolean> {
  if (resourceOwnerId === currentUserId) {
    return true;
  }

  return await isAdmin(currentUserId);
}
