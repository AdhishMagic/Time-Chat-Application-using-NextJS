'use server';

import { connectDB } from '@/lib/db';

/**
 * Example Server Action using MongoDB
 * Server actions run on the server and can be called from client components
 */
export async function getDBStatus(): Promise<{
  success: boolean;
  message: string;
  connectionState?: string;
  error?: string;
}> {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get mongoose instance to check connection state
    const mongoose = require('@/lib/db').default;
    const connectionState = mongoose.connection.readyState;

    const stateMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return {
      success: true,
      message: 'Database status retrieved successfully',
      connectionState: stateMap[connectionState] || 'unknown',
    };
  } catch (error) {
    console.error('Server action error:', error);
    return {
      success: false,
      message: 'Failed to get database status',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Example Server Action that fetches data
 * Replace with your actual Mongoose model queries
 */
export async function fetchUserData(userId: string): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  try {
    await connectDB();

    // Example: You would fetch from your User model
    // const user = await User.findById(userId);
    // if (!user) {
    //   return { success: false, error: 'User not found' };
    // }
    // return { success: true, data: user.toObject() };

    // Placeholder response
    return {
      success: true,
      data: {
        id: userId,
        name: 'Example User',
        message: 'Replace this with actual User.findById() query',
      },
    };
  } catch (error) {
    console.error('Fetch user error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user',
    };
  }
}

/**
 * Example Server Action that creates data
 * Replace with your actual Mongoose model operations
 */
export async function createUserData(userData: {
  name: string;
  email: string;
}): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  try {
    await connectDB();

    // Example: Create a new user
    // const newUser = await User.create({
    //   name: userData.name,
    //   email: userData.email,
    // });
    // return { success: true, data: newUser.toObject() };

    // Placeholder response
    return {
      success: true,
      data: {
        ...userData,
        message: 'Replace this with actual User.create() query',
      },
    };
  } catch (error) {
    console.error('Create user error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user',
    };
  }
}
