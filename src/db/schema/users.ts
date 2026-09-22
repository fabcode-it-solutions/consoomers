import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { media } from "./media";

// Types
export type UserRole = "brand" | "tester" | "admin";
export type InteractionType =
  | "like"
  | "vote"
  | "request_sample"
  | "request_full";
export type LocationType = "urban" | "suburban" | "rural";
export type Gender = "female" | "male" | "non-binary";
export type InterestCategory =
  | "beauty"
  | "fitness"
  | "food"
  | "fashion"
  | "home"
  | "tech"
  | "kids"
  | "pets"
  | "other";
export type TesterTier = "explorer" | "insider" | "trendsetter";
export type ActivityType =
  | "like"
  | "vote"
  | "request_sample"
  | "focus_group_invite"
  | "focus_group_selected";
export type ReferralStatus = "pending" | "joined" | "rejected";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type SampleRequestStatus = 
  | "pending" 
  | "approved" 
  | "rejected" 
  | "shipped" 
  | "delivered";

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    username: varchar("username", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    bio: text("bio"),
    role: varchar("role", { length: 20 }).$type<UserRole>().notNull(),
    phoneNumber: varchar("phone_number", { length: 20 }),
    emailVerified: boolean("email_verified").default(false),
    verificationToken: varchar("verification_token", { length: 255 }),
    verificationExpires: timestamp("verification_expires"),
    resetPasswordToken: varchar("reset_password_token", { length: 255 }),
    resetPasswordExpires: timestamp("reset_password_expires"),
    preferences: jsonb("preferences").default({}),
    fcmTokens: text("fcm_tokens").array().default([]),
    lastLogin: timestamp("last_login"),
    loginCount: integer("login_count").default(0),
    timezone: varchar("timezone", { length: 50 }).default("UTC"),
    locale: varchar("locale", { length: 10 }).default("en-US"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    deletedAt: timestamp("deleted_at"),
    notificationId: uuid("notification_id").defaultRandom(),
    status: varchar("status", { length: 20 }).$type<"active" | "deactivated">().notNull().default("active"),
 
  },
  
  (users) => [
    index("users_id_idx").on(users.id),
    uniqueIndex("users_email_idx").on(users.email),
    index("idx_users_verified").on(users.emailVerified),
    index("idx_users_deleted").on(users.deletedAt),
    index("idx_users_status").on(users.status),
  ]
);

export const usersProfile = pgTable(
  "usersProfileImage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    avatarUrl: uuid("avatar_url").references(() => media.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (users) => [
    index("users_profile_id_idx").on(users.id),
    index("idx_users_id").on(users.userId),
  ]
);

export const csrfTokens = pgTable(
  "csrf_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    sessionId: varchar("session_id", { length: 255 }),
    userId: varchar("user_id", { length: 255 }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    used: timestamp("used_at"),
  },
  (csrfTokens) => [
    index("idx_csrf_token").on(csrfTokens.token),
    index("idx_csrf_session").on(csrfTokens.sessionId),
    index("idx_csrf_user").on(csrfTokens.userId),
  ]
);