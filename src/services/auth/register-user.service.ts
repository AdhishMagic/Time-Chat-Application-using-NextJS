import bcrypt from 'bcryptjs';
import User from '@/models/User';
import Role from '@/models/Role';

export interface RegisterInput {
  email: string;
  password: string;
  username: string;
}

export interface RegisterResult {
  userId: string;
  email: string;
  username: string;
}

export async function registerUserService(
  input: RegisterInput
): Promise<RegisterResult> {
  const { email, password, username } = input;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    throw new Error('Username already taken');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userRole = await Role.findOne({ name: 'user' });

  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    username,
    status: 'offline',
    roleId: userRole?._id || null,
  });

  return {
    userId: user._id.toString(),
    email: user.email,
    username: user.username,
  };
}
