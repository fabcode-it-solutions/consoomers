import { pgTable, text, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";

export const privacyPolicies = pgTable("privacy_policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  heading: text("heading").notNull(),
  order: integer("order").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const privacySections = pgTable("privacy_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  policyId: uuid("policy_id").references(() => privacyPolicies.id, { onDelete: "cascade" }),
  title: text("title"),
  description: text("description"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const privacyPoints = pgTable("privacy_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("section_id").references(() => privacySections.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});