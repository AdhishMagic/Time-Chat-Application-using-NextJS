import bcrypt from 'bcryptjs';
import User from '@/models/User';
import Role from '@/models/Role';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  userId: string;
  email: string;
  name: string;
}

export async function registerUserService(
  input: RegisterInput
): Promise<RegisterResult> {
  const { name, email, password } = input;

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = await Role.findOne({ name: 'user' });

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      username: name,
      status: 'offline',
      roleId: userRole?._id,
    });

    return {
      userId: user._id.toString(),
      email: user.email,
      name: user.username,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Registration failed');
  }
}
