"use server";

import { db } from "@/db/db";

import { eq, lt, and } from "drizzle-orm";
import crypto from "crypto";
import { csrfTokens } from "@/db/schema/users";

export interface CSRFTokenOptions {
  sessionId?: string;
  userId?: string;
  expiresInMinutes?: number;
}

/**
 * Generate a new CSRF token
 * @param options - Configuration for token generation
 * @returns The generated CSRF token string
 */
export async function generateCSRFToken(
  options: CSRFTokenOptions = {}
): Promise<string> {
  const { sessionId, userId, expiresInMinutes = 60 } = options;

  // Generate a cryptographically secure random token
  const token = crypto.randomBytes(32).toString("base64url");

  // Calculate expiration time
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  // Store token in database
  await db.insert(csrfTokens).values({
    token,
    sessionId: sessionId || null,
    userId: userId || null,
    expiresAt,
  });

  return token;
}

/**
 * Validate a CSRF token
 * @param token - The token to validate
 * @param options - Optional validation criteria
 * @returns True if valid, false otherwise
 */
export async function validateCSRFToken(
  token: string,
  options: { sessionId?: string; userId?: string } = {}
): Promise<{ valid: boolean; message?: string }> {
  if (!token) {
    return { valid: false, message: "CSRF token is required" };
  }

  try {
    // Build query conditions
    const conditions = [eq(csrfTokens.token, token)];

    if (options.sessionId) {
      conditions.push(eq(csrfTokens.sessionId, options.sessionId));
    }

    if (options.userId) {
      conditions.push(eq(csrfTokens.userId, options.userId));
    }

    // Find the token
    const [tokenRecord] = await db
      .select()
      .from(csrfTokens)
      .where(and(...conditions))
      .limit(1);

    if (!tokenRecord) {
      return { valid: false, message: "Invalid CSRF token" };
    }

    // Check if token has been used
    if (tokenRecord.used) {
      return { valid: false, message: "CSRF token has already been used" };
    }

    // Check if token has expired
    if (new Date() > tokenRecord.expiresAt) {
      return { valid: false, message: "CSRF token has expired" };
    }

    // Mark token as used (single-use tokens)
    await db
      .update(csrfTokens)
      .set({ used: new Date() })
      .where(eq(csrfTokens.token, token));

    return { valid: true };
  } catch (error) {
    console.error("CSRF validation error:", error);
    return { valid: false, message: "CSRF validation failed" };
  }
}

/**
 * Clean up expired CSRF tokens from database
 * Should be run periodically (e.g., via cron job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const result = await db
      .delete(csrfTokens)
      .where(lt(csrfTokens.expiresAt, new Date()))
      .returning({ id: csrfTokens.id });

    return result.length;
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
    return 0;
  }
}

/**
 * Clean up used CSRF tokens older than specified minutes
 * @param olderThanMinutes - Delete used tokens older than this many minutes
 */
export async function cleanupUsedTokens(
  olderThanMinutes: number = 60
): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - olderThanMinutes * 60 * 1000);

    const result = await db
      .delete(csrfTokens)
      .where(and(lt(csrfTokens.used, cutoffDate)))
      .returning({ id: csrfTokens.id });

    return result.length;
  } catch (error) {
    console.error("Error cleaning up used tokens:", error);
    return 0;
  }
}

/**
 * Revoke all tokens for a specific user or session
 * Useful for logout scenarios
 */
export async function revokeTokens(options: {
  sessionId?: string;
  userId?: string;
}): Promise<number> {
  try {
    const conditions = [];

    if (options.sessionId) {
      conditions.push(eq(csrfTokens.sessionId, options.sessionId));
    }

    if (options.userId) {
      conditions.push(eq(csrfTokens.userId, options.userId));
    }

    if (conditions.length === 0) {
      return 0;
    }

    const result = await db
      .delete(csrfTokens)
      .where(and(...conditions))
      .returning({ id: csrfTokens.id });

    return result.length;
  } catch (error) {
    console.error("Error revoking tokens:", error);
    return 0;
  }
}