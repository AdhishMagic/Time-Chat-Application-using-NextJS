# Time Chat Application

A production-ready real-time chat application built with **Next.js 16** (App Router), **TypeScript**, **MongoDB**, and **Turbopack**. Features a clean, scalable **feature-based modular architecture** with strict code boundaries and comprehensive RBAC (Role-Based Access Control).

## 🎯 Key Features

- **Real-Time Chat** - Send, edit, and delete messages with optimistic concurrency control
- **User Authentication** - Secure login/register with JWT token management
- **Role-Based Access Control (RBAC)** - Permission-based authorization system
- **Modular Architecture** - Feature-based code organization with self-contained modules
- **Message Consistency** - Transactional operations with MongoDB sessions
- **Scalable Design** - Clean separation of concerns (Core, Modules, Services, Store)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with secure token versioning
- **State Management**: Zustand
- **Validation**: Zod
- **UI**: React + Tailwind CSS

## 📁 Architecture

The project follows a **feature-based modular architecture** to prevent code decay and ensure long-term maintainability.

```
/src
├── /core/              # Global infrastructure (locked)
│   ├── /auth/          # JWT, token verification
│   ├── /db/            # MongoDB connection
│   ├── /config/        # Environment configuration
│   └── /utils/         # Safe utility functions
├── /modules/           # Feature-based modules (self-contained)
│   ├── /auth/          # Authentication & registration
│   │   ├── /components # Auth UI (Login, Register)
│   │   ├── /hooks      # useAuth state management
│   │   ├── /services   # Auth business logic
│   │   └── /schemas    # Zod validation schemas
│   └── /chat/          # Chat & messaging
│       ├── /components # Chat UI components
│       ├── /hooks      # useMessages state management
│       ├── /services   # Message operations
│       └── /schemas    # Message validation
├── /services/          # Global services only
│   ├── permission.service.ts  # RBAC infrastructure
│   └── user.service.ts        # User repository
├── /store/             # Global state (Zustand)
├── /models/            # MongoDB Mongoose models
├── /app/               # Next.js App Router pages & routes
└── /lib/               # Shared utilities & legacy shims

See ARCHITECTURE.md for detailed structure rules and import guidelines.
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create `.env.local` with required variables:

```bash
# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=time_chat_app

# JWT Secret (generate: openssl rand -base64 32)
JWT_SECRET=your-secret-key-here

# API URL
API_URL=http://localhost:3000
```

⚠️ **IMPORTANT**: 
- `.env.local` is gitignored - never commit it
- Use `.env.example` to document variables only
- Always use strong, random JWT_SECRET in production

### 3. Database Setup

**Local MongoDB (Development)**:
```bash
# Start MongoDB locally (Docker example)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Seed RBAC data (optional)
npm run seed:rbac
```

**Production**: See [MONGODB_SETUP.md](MONGODB_SETUP.md)

### 4. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

## 📋 Available Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
npm run seed:rbac    # Seed RBAC roles and permissions

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🗺️ Main Routes

### Public Routes
- `/login` - User login page
- `/register` - User registration page

### Protected Routes (Auth Required)
- `/chat` - Main chat interface
- `/api/messages/send` - Send message
- `/api/messages/[conversationId]` - Get conversation messages
- `/api/messages/edit/[messageId]` - Edit message
- `/api/messages/delete/[messageId]` - Delete message

### Admin Routes
- `/api/auth/login` - Login endpoint
- `/api/auth/register` - Register endpoint

## 🔐 Authentication Flow

1. **Register**: Create account → Password hashed → User saved
2. **Login**: Email + password → JWT token generated → Token stored in cookies
3. **Protected Routes**: Token verified → User context set → Request processed
4. **Token Refresh**: On expiry → New token issued via token versioning
5. **Logout**: Token revoked → Version incremented → User logged out

## 💬 Chat Features

### Message Operations
- **Send**: Create message with idempotent check (clientMessageId)
- **Edit**: Update with optimistic concurrency (version control)
- **Delete**: Soft delete with cascade to conversation preview
- **Retrieve**: Paginated message history per conversation

### Message Consistency
- Transactional operations with MongoDB sessions
- Duplicate detection via clientMessageId
- Version-based optimistic concurrency control
- Cascade updates to parent conversation

## 🔒 Security Features

### Authentication
- JWT with configurable expiration
- Secure password hashing (bcrypt)
- HttpOnly cookies (HTTP-only, Secure flags)
- Token versioning for forced logout

### Authorization
- Role-Based Access Control (RBAC)
- Permission enforcement on all protected endpoints
- Resource ownership verification
- Rate limiting on auth endpoints

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention (MongoDB)
- XSS protection (React + sanitization)
- CORS configuration
- Environment variables never exposed to client

## 📊 Project Statistics

- **Build Time**: ~6s (Turbopack)
- **TypeScript Errors**: 0
- **Build Warnings**: 0
- **Routes**: 11 total (7 API, 4 pages)
- **Modules**: 2 (auth, chat)
- **Test Coverage**: Ready for integration

## 🏗️ Architecture Principles

### 1. Feature-Based Organization
- Each feature is a self-contained module
- Modules include: components, hooks, services, schemas
- Clear public API via index.ts

### 2. Strict Boundaries
- ✅ Modules can import from `/core`
- ✅ App can import from modules
- ❌ Cross-module imports prohibited
- ❌ Core cannot import from modules

### 3. Single Responsibility
- Core: Infrastructure only (auth, db, config)
- Modules: Business logic for one feature
- Services: Global infrastructure (RBAC, user repo)
- Store: Global state management

### 4. Scalability
- Adding new features: Create `/modules/{feature}` with standard structure
- No modifications to core or other modules needed
- Each module independently testable and deployable

See [ARCHITECTURE.md](ARCHITECTURE.md) for comprehensive enforcement rules.

## 🧪 Testing & Validation

### Development Testing
```bash
# Login Test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Chat Test
curl -X GET http://localhost:3000/api/messages/[conversationId] \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Build Verification
```bash
npm run build
# Should complete with ✓ Compiled successfully - 0 errors
```

## 📝 Database Models

### User
- username, email (unique), password (hashed)
- avatar, status, roleId, tokenVersion
- Timestamps: createdAt, updatedAt

### Conversation
- participants (User array), createdBy
- name, description, lastMessagePreview, lastMessageAt
- Timestamps: createdAt, updatedAt

### Message
- conversationId, senderId, text, mediaUrl
- messageType, isDeleted, editedAt, clientMessageId
- Version control for optimistic concurrency
- Timestamps: createdAt, updatedAt

### Role & Permission
- Role: name, description
- Permission: action, resource
- RolePermission: many-to-many junction

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed architecture rules and patterns
- [PHASE_2_COMPLETION.md](PHASE_2_COMPLETION.md) - Recent refactoring details
- [MONGODB_SETUP.md](MONGODB_SETUP.md) - Database configuration

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB or update MONGODB_URI in .env.local

### JWT Secret Missing
```
Error: JWT_SECRET is required
```
**Solution**: Add JWT_SECRET to .env.local

### port 3000 Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
npm run dev
```

## 📦 Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables (Production)
Set via platform secrets or environment configuration:
- MONGODB_URI (production database)
- JWT_SECRET (strong, random key)
- API_URL (production domain)
- NODE_ENV=production

### Performance
- Turbopack compilation: ~6s
- Static page generation: 11 pages
- API routes: Server-rendered on demand
- Middleware: Active for protected routes

## 🤝 Contributing

When adding new features:

1. **Create Module**: `mkdir -p src/modules/{feature}/{components,hooks,services,schemas}`
2. **Follow Pattern**: Implement all subdirectories (see auth/chat modules)
3. **Public API**: Export from `index.ts`
4. **No Cross-Module Imports**: Each module is independent
5. **Tests**: Add tests for business logic (services)
6. **Documentation**: Update relevant .md files

See [ARCHITECTURE.md](ARCHITECTURE.md) section 6 for detailed feature creation guide.

## 📄 License

[Add your license here]

## 🙋 Support

For issues or questions:
1. Check ARCHITECTURE.md for code organization questions
2. Review PHASE_2_COMPLETION.md for recent changes
3. Check database models in `/src/models/`
4. Review services in `/src/modules/`
