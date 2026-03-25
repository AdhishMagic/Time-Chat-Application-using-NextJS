import User from '@/models/User';
import { Types } from 'mongoose';

export async function revokeUserTokensService(userId: string): Promise<void> {
  let userIdObj: Types.ObjectId;

  try {
    userIdObj = new Types.ObjectId(userId);
  } catch {
    throw new Error('Invalid user ID format');
  }

  const user = await User.findById(userIdObj);
  if (!user) {
    throw new Error('User not found');
  }

  user.tokenVersion += 1;
  await user.save();
}
