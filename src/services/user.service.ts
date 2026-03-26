/**
 * User Service
 * Handles all user-related database operations
 * Repository pattern: Abstracts DB layer from business logic
 */

import { connectDB } from '@/core/db';
import User from '@/models/User';

export interface CreateUserInput {
  email: string;
  password: string;
  username?: string;
}

export interface UpdateUserInput {
  username?: string;
  profile?: Record<string, unknown>;
}

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput) {
  try {
    await connectDB();
    const user = new User(input);
    await user.save();
    return { success: true, user: user.toJSON(), error: null };
  } catch (error) {
    console.error('[USER_SERVICE] Create user error:', error);
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : 'Failed to create user',
    };
  }
}

/**
 * Find user by ID
 */
export async function getUserById(userId: string) {
  try {
    await connectDB();
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return { success: true, user: null, error: null };
    }

    return { success: true, user: user.toJSON(), error: null };
  } catch (error) {
    console.error('[USER_SERVICE] Get user by ID error:', error);
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : 'Failed to fetch user',
    };
  }
}

/**
 * Find user by email
 */
export async function getUserByEmail(email: string) {
  try {
    await connectDB();
    const user = await User.findOne({ email }).select('-password');

    if (!user) {
      return { success: true, user: null, error: null };
    }

    return { success: true, user: user.toJSON(), error: null };
  } catch (error) {
    console.error('[USER_SERVICE] Get user by email error:', error);
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : 'Failed to fetch user',
    };
  }
}

/**
 * Update user profile
 */
export async function updateUser(userId: string, input: UpdateUserInput) {
  try {
    await connectDB();
    const user = await User.findByIdAndUpdate(userId, input, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return {
        success: false,
        user: null,
        error: 'User not found',
      };
    }

    return { success: true, user: user.toJSON(), error: null };
  } catch (error) {
    console.error('[USER_SERVICE] Update user error:', error);
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : 'Failed to update user',
    };
  }
}

/**
 * Delete user
 */
export async function deleteUser(userId: string) {
  try {
    await connectDB();
    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('[USER_SERVICE] Delete user error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user',
    };
  }
}

/**
 * Check if user exists by email
 */
export async function userExists(email: string): Promise<boolean> {
  try {
    await connectDB();
    const count = await User.countDocuments({ email });
    return count > 0;
  } catch (error) {
    console.error('[USER_SERVICE] Check user exists error:', error);
    return false;
  }
}

/**
 * Authenticate user (example - implement as needed)
 */
export async function authenticateUser(email: string, password: string) {
  try {
    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, user: null, error: 'User not found' };
    }

    // Compare password using your hashing method
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //   return { success: false, user: null, error: 'Invalid password' };
    // }

    return {
      success: true,
      user: user.toJSON(),
      error: null,
    };
  } catch (error) {
    console.error('[USER_SERVICE] Authenticate user error:', error);
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}
