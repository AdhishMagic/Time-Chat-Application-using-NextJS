# MongoDB + Mongoose + Next.js App Router Setup Guide

This document describes the robust MongoDB integration for your Next.js application using Mongoose and TypeScript.

## 📁 Files Created/Updated

### 1. **lib/db.ts** - Database Connection Utility
The core database connection module with singleton pattern and global caching.

**Key Features:**
- ✅ Singleton pattern prevents multiple connections
- ✅ Global caching for connection reuse (survives hot reloads)
- ✅ Environment variable validation
- ✅ Error handling and logging
- ✅ Serverless-friendly (Vercel compatible)
- ✅ TypeScript support

**Connection States:**
- `0` = disconnected
- `1` = connected
- `2` = connecting
- `3` = disconnecting

---

## 📝 Environment Variables

Already configured in `.env.local`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=realtime_chat_app
```

**For Production (MongoDB Atlas):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=your_database_name
```

---

## 🔧 Usage Examples

### Example 1: Using in API Routes

**File:** `src/app/api/test/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get connection state
    const connectionState = mongoose.connection.readyState;
    
    return NextResponse.json({
      ok: true,
      database: {
        connected: connectionState === 1,
        state: stateMap[connectionState],
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Use your Mongoose models here
    // const result = await YourModel.create(body);

    return NextResponse.json(
      { ok: true, data: body },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

### Example 2: Using in Server Actions

**File:** `src/app/actions/dbExample.ts`

```typescript
'use server';

import { connectDB } from '@/lib/db';

// Fetch data
export async function fetchUserData(userId: string) {
  try {
    await connectDB();

    // Use your Mongoose models
    // const user = await User.findById(userId);
    // return { success: true, data: user };

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Create data
export async function createUserData(userData: { name: string; email: string }) {
  try {
    await connectDB();

    // const newUser = await User.create(userData);
    // return { success: true, data: newUser };

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

**Usage in Client Component:**

```typescript
'use client';

import { fetchUserData, createUserData } from '@/app/actions/dbExample';

export default function MyComponent() {
  async function handleFetch() {
    const result = await fetchUserData('user-id-here');
    console.log(result);
  }

  async function handleCreate() {
    const result = await createUserData({
      name: 'John Doe',
      email: 'john@example.com',
    });
    console.log(result);
  }

  return (
    <>
      <button onClick={handleFetch}>Fetch User</button>
      <button onClick={handleCreate}>Create User</button>
    </>
  );
}
```

---

## 🗂️ Creating Mongoose Models

**Example Model:** `src/models/User.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
```

---

## 🚀 Best Practices Implemented

| Practice | Implementation |
|----------|-----------------|
| **Singleton Pattern** | Connection cached globally, reused across requests |
| **No Multiple Connections** | Global `cached` object prevents reconnects |
| **Environment Validation** | Throws error if `MONGODB_URI` or `MONGODB_DB_NAME` missing |
| **Graceful Error Handling** | Try-catch blocks with detailed error messages |
| **Development Hot Reload** | Connection survives Next.js dev server reloads |
| **Serverless Compatible** | Works with Vercel and other serverless providers |
| **TypeScript Support** | Full type safety with interfaces |
| **Logging** | Connection status logged to console |

---

## ⚠️ Common Issues & Solutions

### Issue: "MONGODB_URI is not defined"
**Solution:** Add to `.env.local`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=your_db_name
```

### Issue: Multiple Connections in Development
**Solution:** Already handled by global caching in `lib/db.ts`

### Issue: Connection Timeout
**Solution:** Check if MongoDB is running:
```bash
# For local MongoDB
mongosh

# For MongoDB Atlas, ensure IP whitelist includes your address
```

### Issue: Models Not Found After Connection
**Solution:** Import models AFTER calling `connectDB()`:
```typescript
await connectDB();
const { User } = require('@/models/User');
```

---

## 🧪 Testing Database Connection

Test the connection by visiting:
```
http://localhost:3000/api/test
```

Expected response:
```json
{
  "ok": true,
  "message": "Server time: ...",
  "database": {
    "connected": true,
    "state": "connected",
    "timestamp": "2026-03-26T..."
  }
}
```

---

## 📦 Installed Packages

- **mongoose** (^9.3.2) - ODM for MongoDB
- **next** (16.2.1) - React framework with App Router
- **typescript** (^5) - Type safety

---

## 🔄 Next Steps

1. ✅ Run `npm install` (mongoose already installed)
2. ✅ Ensure MongoDB is running locally or connect to MongoDB Atlas
3. ✅ Test connection: `curl http://localhost:3000/api/test`
4. ✅ Create your Mongoose models in `src/models/`
5. ✅ Use `connectDB()` in API routes and Server Actions
6. ✅ Deploy to production with proper `MONGODB_URI`

---

## 📚 Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [MongoDB Connection Strings](https://docs.mongodb.com/manual/reference/connection-string/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
