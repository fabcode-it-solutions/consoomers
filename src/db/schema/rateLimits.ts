import { uuid, varchar, pgTable, timestamp, index } from "drizzle-orm/pg-core";
export const rateLimits = pgTable(
  "rate_limits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ipAddress: varchar("ipAddress", { length: 255 }).notNull(),
    route: varchar("route", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (rateLimits) => [
    index("idx_rate_limits").on(rateLimits.ipAddress),
    index("idx_rate_limits_routes").on(rateLimits.route),
  ]
);
