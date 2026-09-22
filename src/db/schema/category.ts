import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { media } from "./media";
import { users } from "./users";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 100 }).notNull(),
    handle: text("handle").notNull().unique(),
    description: text("description"),
    imageId: uuid("image_id").references(() => media.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (categories) => [
    uniqueIndex("idx_categories_name").on(categories.name),
    uniqueIndex("idx_categories_handle").on(categories.handle),
    index("idx_categories_id").on(categories.id),
    index("idx_categories_userId").on(categories.userId),
  ]
);
