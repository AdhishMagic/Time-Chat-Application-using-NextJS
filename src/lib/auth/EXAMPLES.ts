/**
 * RBAC Implementation Examples
 * 
 * This file shows practical examples of how to use the RBAC system
 * in your API routes and services.
 */

// ============================================================================
// EXAMPLE 1: Simple Permission Check (Send Message)
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { hasPermission } from '@/services/permission.service';
import { PERMISSIONS } from '@/lib/auth/permissions';

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');

  // Check permission
  const canCreate = await hasPermission(userId, PERMISSIONS.MESSAGE_CREATE);
  
  if (!canCreate) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Continue with route logic...
  return NextResponse.json({ success: true });
}
*/

// ============================================================================
// EXAMPLE 2: Permission + Ownership Check (Edit Message)
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { hasPermission, isAdmin } from '@/services/permission.service';
import { checkOwnership } from '@/lib/auth/ownership';
import { PERMISSIONS } from '@/lib/auth/permissions';
import Message from '@/models/Message';

export async function PATCH(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const messageId = request.nextUrl.searchParams.get('id');

  // Step 1: Check permission
  const canEdit = await hasPermission(userId, PERMISSIONS.MESSAGE_EDIT);
  if (!canEdit) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Step 2: Fetch resource
  const message = await Message.findById(messageId);
  if (!message) {
    return NextResponse.json(
      { success: false, error: 'Message not found' },
      { status: 404 }
    );
  }

  // Step 3: Check ownership (users can only edit their own, admins can edit any)
  const userIsAdmin = await isAdmin(userId);
  const owns = await checkOwnership(
    message.senderId.toString(),
    userId,
    userIsAdmin
  );

  if (!owns) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Continue with update logic...
  message.text = 'updated text';
  await message.save();

  return NextResponse.json({ success: true, data: message });
}
*/

// ============================================================================
// EXAMPLE 3: Role-Based Access (Admin Panel)
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, getUserRole } from '@/services/permission.service';
import { ROLES } from '@/lib/auth/roles';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');

  // Method 1: Check if admin
  if (!(await isAdmin(userId))) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }

  // OR Method 2: Check specific role
  const role = await getUserRole(userId);
  if (role !== ROLES.ADMIN) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Admin logic here...
  return NextResponse.json({ success: true, data: 'admin data' });
}
*/

// ============================================================================
// EXAMPLE 4: Multiple Permissions Check
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { hasAnyPermission, hasAllPermissions } from '@/services/permission.service';
import { PERMISSIONS } from '@/lib/auth/permissions';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');

  // Check if user has ANY of these permissions
  const canViewAnalytics = await hasAnyPermission(userId, [
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.SYSTEM_CONFIG,
  ]);

  if (!canViewAnalytics) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Check if user has ALL of these permissions
  const isFullAdmin = await hasAllPermissions(userId, [
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.SYSTEM_CONFIG,
  ]);

  return NextResponse.json({
    success: true,
    data: {
      canViewAnalytics,
      isFullAdmin,
    },
  });
}
*/

// ============================================================================
// EXAMPLE 5: Bulk Ownership Check (Filtering Messages)
// ============================================================================

/*
import { getAccessibleResourceIds } from '@/lib/auth/ownership';
import Message from '@/models/Message';

export async function getAccessibleMessages(userId: string) {
  // Fetch all messages (example)
  const allMessages = await Message.find();
  
  // Get which messages the user can access
  const ownerIds = allMessages.map(m => m.senderId.toString());
  const accessible = await getAccessibleResourceIds(ownerIds, userId);
  
  // Return only accessible messages
  return allMessages.filter(m => accessible.includes(m.senderId.toString()));
}
*/

// ============================================================================
// EXAMPLE 6: Service Layer Implementation
// ============================================================================

/*
import { hasPermission, isAdmin } from '@/services/permission.service';
import { checkOwnership } from '@/lib/auth/ownership';
import { PERMISSIONS } from '@/lib/auth/permissions';
import Message from '@/models/Message';

export async function deleteMessageService(messageId: string, userId: string) {
  // Check permission
  const canDelete = await hasPermission(userId, PERMISSIONS.MESSAGE_DELETE);
  if (!canDelete) {
    throw new Error('Forbidden: No delete permission');
  }

  // Fetch message
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  // Check ownership
  const userIsAdmin = await isAdmin(userId);
  const owns = await checkOwnership(
    message.senderId.toString(),
    userId,
    userIsAdmin
  );

  if (!owns) {
    throw new Error('Forbidden: Cannot delete other users messages');
  }

  // Perform deletion
  message.isDeleted = true;
  await message.save();

  return message;
}
*/

// ============================================================================
// EXAMPLE 7: Updating User Role (Admin Only)
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { assignRoleToUser, isAdmin, clearUserPermissionCache } from '@/services/permission.service';
import { ROLES } from '@/lib/auth/roles';

export async function PUT(request: NextRequest) {
  const requesterUserId = request.headers.get('x-user-id');
  const body = await request.json();

  // Step 1: Only admins can assign roles
  if (!(await isAdmin(requesterUserId))) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }

  const { targetUserId, newRole } = body;

  // Step 2: Validate role
  if (!Object.values(ROLES).includes(newRole)) {
    return NextResponse.json(
      { success: false, error: 'Invalid role' },
      { status: 400 }
    );
  }

  // Step 3: Assign role
  const updated = await assignRoleToUser(targetUserId, newRole);

  // Step 4: Clear cache
  clearUserPermissionCache(targetUserId);

  return NextResponse.json({ success: true, data: updated });
}
*/

// ============================================================================
// EXAMPLE 8: Middleware-Based Protection (Using withPermission)
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/auth/authorization';
import { PERMISSIONS } from '@/lib/auth/permissions';

async function messageDeleteHandler(request: NextRequest) {
  // Your route logic here
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  // Custom permission check with async validation
  const permissionCheck = await withPermission(
    PERMISSIONS.MESSAGE_DELETE,
    async (req, userId) => {
      // Optional: Add custom logic
      const messageId = req.nextUrl.searchParams.get('id');
      
      // Validate something custom
      const message = await Message.findById(messageId);
      return message?.senderId.toString() === userId || message?.moderatable;
    }
  )(request);

  if (permissionCheck) {
    return permissionCheck; // Permission denied
  }

  return messageDeleteHandler(request);
}
*/

// ============================================================================
// EXAMPLE 9: Error Handling Pattern
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { hasPermission } from '@/services/permission.service';

function createErrorResponse(error: Error | string, statusCode: number) {
  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : error,
    },
    { status: statusCode }
  );
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const canCreate = await hasPermission(userId, 'message:create');
    if (!canCreate) {
      return createErrorResponse('Forbidden', 403);
    }

    // Success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Route error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}
*/

// ============================================================================
// EXAMPLE 10: Database Migration (Add Roles to Existing Users)
// ============================================================================

/*
import { assignRoleToUser } from '@/services/permission.service';
import User from '@/models/User';
import { ROLES } from '@/lib/auth/roles';

export async function migrateUsersToRoles() {
  const users = await User.find({ roleId: null });

  for (const user of users) {
    // Assign default role to users without roles
    await assignRoleToUser(user._id.toString(), ROLES.USER);
  }

  console.log(`Migrated ${users.length} users`);
}
*/

export const examples = {
  note: 'See comments in this file for implementation examples',
};
