import User from '@/models/User';
import { Types } from 'mongoose';

export async function verifyTokenVersion(
  userId: string,
  tokenVersion: number
): Promise<boolean> {
  let userIdObj: Types.ObjectId;

  try {
    userIdObj = new Types.ObjectId(userId);
  } catch {
    return false;
  }

  try {
    const user = await User.findById(userIdObj);
    return user?.tokenVersion === tokenVersion;
  } catch {
    return false;
  }
}
