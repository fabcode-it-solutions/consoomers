import { boolean, index,  jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { testerProfiles } from "./tester";

export const testerNotifications = pgTable(
  "tester_notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    testerId: uuid("tester_id") .notNull().references(() => testerProfiles.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(), 
    title: varchar("title", { length: 200 }),
    message: text("message").notNull(),
    entityType: varchar("entity_type", { length: 50 }), 
    entityId: uuid("entity_id"),
    deliveredChannels: jsonb("delivered_channels")
      .$type<("email" | "push" | "sms" | "in_admin_panel")[]>()
      .default([]),
    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at"),
    actionUrl: varchar("action_url", { length: 500 }),
    actionLabel: varchar("action_label", { length: 100 }),
    metadata: jsonb("metadata").default({}),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    testerIdx: index("tester_notifications_tester_idx").on(table.testerId),
    unreadIdx: index("tester_notifications_unread_idx").on(
      table.testerId,
      table.isRead
    ),
    entityIdx: index("tester_notifications_entity_idx").on(
      table.entityType,
      table.entityId
    ),
  })
);

export const testerNotificationSettings = pgTable(
  "tester_notification_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    testerId: uuid("tester_id")
      .notNull()
      .unique()
      .references(() => testerProfiles.id, { onDelete: "cascade" }),
    pauseAll: boolean("pause_all").default(false),
    pauseUntil: timestamp("pause_until"),
    email: boolean("email").default(true),
    push: boolean("push").default(true),
    sms: boolean("sms").default(false),
    inAdminPanel: boolean("in_admin_panel").default(true),
    categories: jsonb("categories")
      .$type<{
        beauty?: boolean;
        fitness?: boolean;
        home?: boolean;
        food?: boolean;
        tech?: boolean;
        fashion?: boolean;
        kids?: boolean;
        pets?: boolean;
      }>()
      .default({}),    
    emailDigest: varchar("email_digest", { length: 20 }).default("immediate"), 
    pushDigest: varchar("push_digest", { length: 20 }).default("immediate"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    testerIdx: index("settings_tester_idx").on(table.testerId),
  })
);

