import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "@/db/schema";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const log = process.env.NODE_ENV !== "production";

declare global {
  var pgPool: Pool | undefined;
  var drizzleDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

let isConnected = false;
let connectionPromise: Promise<void> | null = null;

const pool =
  global.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    max: 10,
    min: 1,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 3000,
    keepAlive: true,
  });

pool.on("connect", () => {
  if (log) console.log(`✅ Connected to database. Total: ${pool.totalCount}`);
  isConnected = true;
});

pool.on("acquire", () => {
  if (log) console.log(`ℹ Client acquired. Active: ${pool.totalCount}`);
});

pool.on("remove", () => {
  if (log) console.log(` Client removed. Remaining: ${pool.totalCount}`);
});

pool.on("error", (err) => {
  console.error(" Unexpected error on idle client", err);
  isConnected = false;
});

const db = global.drizzleDb ?? drizzle(pool, { schema, logger: false });

async function initializeConnection(): Promise<void> {
  if (isConnected || connectionPromise) {
    return connectionPromise || Promise.resolve();
  }

  connectionPromise = (async () => {
    try {
      const client = await pool.connect();
      await client.query("SELECT NOW()");
      client.release();
      isConnected = true;
      if (log) console.log(" Database connection established successfully");
    } catch (error) {
      console.error(" Failed to connect to database:", error);
      isConnected = false;
      throw error;
    }
  })();

  return connectionPromise;
}

function getConnectionStatus() {
  return {
    isConnected,
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

async function closeConnection(): Promise<void> {
  try {
    await pool.end();
    isConnected = false;
    connectionPromise = null;
    if (log) console.log(" Database connection closed gracefully");
  } catch (error) {
    console.error(" Error closing database connection:", error);
  }
}

process.on("SIGINT", async () => {
  if (log) console.log("SIGINT received, closing database connection...");
  await closeConnection();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  if (log) console.log("SIGTERM received, closing database connection...");
  await closeConnection();
  process.exit(0);
});

if (process.env.NODE_ENV !== "production") {
  global.pgPool = pool;
  global.drizzleDb = db;
}

export { pool, db, initializeConnection, getConnectionStatus, closeConnection };
