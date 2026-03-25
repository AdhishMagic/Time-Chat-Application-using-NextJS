import bcrypt from 'bcryptjs';
import User from '@/models/User';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  userId: string;
  email: string;
  username: string;
  tokenVersion: number;
}

const DUMMY_HASH =
  '$2b$10$jSJ5Ov4dO8k3qV2R9X7Z8eF4H6J2K0L1M3N5O7P9Q1R3S5T7U9V';

export async function loginUserService(
  input: LoginInput
): Promise<LoginResult> {
  const { email, password } = input;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password'
  );

  const hashToCheck = user?.password || DUMMY_HASH;
  const passwordMatch = await bcrypt.compare(password, hashToCheck);

  if (!user || !passwordMatch) {
    throw new Error('Invalid email or password');
  }

  return {
    userId: user._id.toString(),
    email: user.email,
    username: user.username,
    tokenVersion: user.tokenVersion,
  };
}
