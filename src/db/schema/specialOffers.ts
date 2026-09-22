import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { brands } from "./brands";

// Special offers table
export const specialOffers = pgTable("special_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brands.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  discountCode: varchar("discount_code", { length: 100 }),
  affiliateLink: text("affiliate_link"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
