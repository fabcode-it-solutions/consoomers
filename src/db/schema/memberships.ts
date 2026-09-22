import {
  uuid,
  varchar,
  numeric,
  pgTable,
  jsonb,
  boolean,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { brands } from "./brands";

// Memberships table
export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 50 }).notNull().unique(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    features: jsonb("features").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (memberships) => [index("idx_memberships_id").on(memberships.id)]
);

// Brand subscriptions table
export const brandSubscriptions = pgTable(
  "brand_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    membershipId: uuid("membership_id")
      .notNull()
      .references(() => memberships.id),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (brandSubscriptions) => [
    index("idx_subscriptions_active").on(
      brandSubscriptions.brandId,
      brandSubscriptions.isActive
    ),
  ]
);
