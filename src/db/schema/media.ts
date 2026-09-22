import {
  uuid,
  varchar,
  pgTable,
  timestamp,
  index,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "./users";
export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    src: varchar("src", { length: 255 }).notNull(),
    type: varchar("type", { length: 100 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    key: varchar("key", { length: 255 }).notNull(),
    size: varchar("size", { length: 500 }),
    width: integer("width"),
    height: integer("height"),
    format: varchar("format", { length: 500 }),
    alt: varchar("alt", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    isPublic: boolean("is_public").default(true),
    isArchived: boolean("is_archived").default(false),
  },
  (media) => [
    index("idx_media_id").on(media.id),
    index("idx_media_userId").on(media.type),
  ]
);
