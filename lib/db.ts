import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

if (!MONGODB_DB_NAME) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_DB_NAME"');
}

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global object to persist connections across hot reloads in development
const globalWithMongoose = global as typeof globalThis & {
  mongoose: MongooseConnection;
};

let cached: MongooseConnection = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

/**
 * Structured logging utility
 */
const dbLog = {
  info: (message: string) => console.log(`[DB] ${message}`),
  error: (message: string, error?: Error) => {
    console.error(`[DB] ${message}`, error ? `\n${error.message}` : '');
  },
  warn: (message: string) => console.warn(`[DB] ${message}`),
};

/**
 * Get current connection status
 * @returns {number} Connection state (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
 */
export function getConnectionStatus(): number {
  return mongoose.connection.readyState;
}

/**
 * Check if database is ready
 */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Connect to MongoDB using Mongoose
 * Implements singleton pattern to avoid multiple connections
 * Reuses cached connections in development (hot reload) and production
 *
 * @returns {Promise<typeof mongoose>} Mongoose instance
 * @throws {Error} If connection fails after max retries
 */
export async function connectDB(): Promise<typeof mongoose> {
  // Check if already connected
  if (cached.conn && isConnected()) {
    dbLog.info('Reusing existing connection');
    return cached.conn;
  }

  // Prevent duplicate connection attempts
  if (cached.promise) {
    dbLog.info('Connection attempt in progress, reusing promise');
    return cached.promise;
  }

  dbLog.info('Initiating new MongoDB connection');

  cached.promise = mongoose
    .connect(MONGODB_URI!, {
      dbName: MONGODB_DB_NAME,
      bufferCommands: false,
      // Connection pool and timeout settings for stability
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
    })
    .then((connection) => {
      dbLog.info('Connected successfully');
      return connection;
    })
    .catch((error: Error) => {
      dbLog.error('Connection failed', error);
      cached.promise = null;
      throw error;
    });

  try {
    cached.conn = await cached.promise;
    setupConnectionEventListeners();
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

/**
 * Setup event listeners for connection lifecycle
 */
function setupConnectionEventListeners(): void {
  const db = mongoose.connection;

  db.on('connected', () => {
    dbLog.info('Mongoose connected to MongoDB');
  });

  db.on('error', (error: Error) => {
    dbLog.error('Mongoose connection error', error);
  });

  db.on('disconnected', () => {
    dbLog.info('Mongoose disconnected from MongoDB');
  });

  db.on('reconnected', () => {
    dbLog.info('Mongoose reconnected to MongoDB');
  });
}

/**
 * Disconnect from MongoDB
 * Useful for cleanup in tests or when shutting down the server
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn || isConnected()) {
    try {
      await mongoose.disconnect();
      cached.conn = null;
      cached.promise = null;
      dbLog.info('Disconnected');
    } catch (error) {
      dbLog.error('Disconnect error', error as Error);
      throw error;
    }
  }
}

/**
 * Setup graceful shutdown handlers
 * Closes DB connection on process termination
 */
export function setupGracefulShutdown(): void {
  const signals: Array<NodeJS.Signals> = ['SIGINT', 'SIGTERM'];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      dbLog.warn(`Received ${signal}, closing database connection`);
      try {
        await disconnectDB();
        dbLog.info('Database connection closed');
        process.exit(0);
      } catch (error) {
        dbLog.error('Error during graceful shutdown', error as Error);
        process.exit(1);
      }
    });
  });
}

export default mongoose;
