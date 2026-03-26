import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const mongodbUri: string = process.env.MONGODB_URI ?? "";

if (!mongodbUri) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

const cache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cache;

/**
 * Structured logging utility
 */
const dbLog = {
  info: (message: string) => console.log(`[DB] ${message}`),
  error: (message: string, error?: Error) => {
    console.error(`[DB] ${message}`, error ? `\n${error.message}` : "");
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
  return connectToDatabase();
}

/**
 * Legacy function name for backward compatibility
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Check if already connected
  if (cache.conn && isConnected()) {
    dbLog.info("Reusing existing connection");
    return cache.conn;
  }

  // Prevent duplicate connection attempts
  if (cache.promise) {
    dbLog.info("Connection attempt in progress, reusing promise");
    return await cache.promise;
  }

  dbLog.info("Initiating new MongoDB connection");

  cache.promise = mongoose
    .connect(mongodbUri, {
      dbName: process.env.MONGODB_DB_NAME ?? "time_chat_app",
      bufferCommands: false,
      // Connection pool and timeout settings for stability
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
    })
    .then((connection) => {
      dbLog.info("Connected successfully");
      return connection;
    })
    .catch((error: Error) => {
      dbLog.error("Connection failed", error);
      cache.promise = null;
      throw error;
    });

  try {
    cache.conn = await cache.promise;
    setupConnectionEventListeners();
    return cache.conn;
  } catch (error) {
    cache.promise = null;
    cache.conn = null;
    throw error;
  }
}

/**
 * Setup event listeners for connection lifecycle
 */
function setupConnectionEventListeners(): void {
  const db = mongoose.connection;

  db.on("connected", () => {
    dbLog.info("Mongoose connected to MongoDB");
  });

  db.on("error", (error: Error) => {
    dbLog.error("Mongoose connection error", error);
  });

  db.on("disconnected", () => {
    dbLog.info("Mongoose disconnected from MongoDB");
  });

  db.on("reconnected", () => {
    dbLog.info("Mongoose reconnected to MongoDB");
  });
}

/**
 * Disconnect from MongoDB
 * Useful for cleanup in tests or when shutting down the server
 */
export async function disconnectDB(): Promise<void> {
  if (cache.conn || isConnected()) {
    try {
      await mongoose.disconnect();
      cache.conn = null;
      cache.promise = null;
      dbLog.info("Disconnected");
    } catch (error) {
      dbLog.error("Disconnect error", error as Error);
      throw error;
    }
  }
}

/**
 * Setup graceful shutdown handlers
 * Closes DB connection on process termination
 */
export function setupGracefulShutdown(): void {
  const signals: Array<NodeJS.Signals> = ["SIGINT", "SIGTERM"];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      dbLog.warn(`Received ${signal}, closing database connection`);
      try {
        await disconnectDB();
        dbLog.info("Database connection closed");
        process.exit(0);
      } catch (error) {
        dbLog.error("Error during graceful shutdown", error as Error);
        process.exit(1);
      }
    });
  });
}

export default mongoose;
