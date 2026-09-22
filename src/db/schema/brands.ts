import {
  uuid,
  varchar,
  text,
  pgTable,
  timestamp,
  numeric,
  index,
  jsonb,
  bigint,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { media } from "./media";
import { sql } from "drizzle-orm";

export const brands = pgTable(
  "brands",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull() .references(() => users.id),
    name: varchar("name", { length: 255 }).notNull(),
    website: varchar("website", { length: 255 }),
    industry: varchar("industry", { length: 100 }),
    position: varchar("position", { length: 100 }),
    category: varchar("category", { length: 100 }),
    preferences: jsonb("preferences").default({}),
    logo: uuid("logo").references(() => media.id),
    coverImage: uuid("coverImage").references(() => media.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    handle: text("handle").notNull().unique(),
    brandName: varchar("brand_name", { length: 255 }).default(""),
    sellingInUS: varchar("selling_in_us", { length: 255 }).default(""),
    goals: jsonb("goals").default([]),
    description: text("description"),
    brandImages: jsonb("brand_images").default([]),
    brandNum: bigint("brand_num", { mode: "number" })
      .notNull()
      .unique()
      .default(sql`nextval('brand_hash_id_seq')`),
    brandId: text("brand_hash_id")
      .notNull()
      .unique()
      .default(sql`'#BR' || LPAD(nextval('brand_hash_id_seq')::text, 8, '0')`),
    accessPassword: varchar("access_password", { length: 255 }),
  },
  (brands) => [
    index("idx_brands_user").on(brands.userId),
    index("idx_brands_id").on(brands.id),
  ]
);


export const createCategories = pgTable(
  "create_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (categories) => [
    index("index_categories_name").on(categories.name),
  ]
);

export const brandCreate = pgTable("brand_create", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  brandName: varchar("brand_name", { length: 255 }).notNull(),
  countryFounded: varchar("country_founded", { length: 255 }),
  currentOwnership: varchar("current_ownership", { length: 255 }),
  brandMedia: jsonb("brand_media").default([]),
  logo: uuid("logo").references(() => media.id),
  products: jsonb("products").default([]),
  productsCsv: jsonb("products_csv").default([]),
  brandId: uuid("brand_id").references(() => brands.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


export const brandRequests = pgTable(
  "brand_request",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brandCreate.id),      
    status: text("status").default("pending"),   
    userId: uuid("user_id").notNull().references(() => users.id),         
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    notes: jsonb("notes"),  
    statusRecord: jsonb("status_record"),
  },
  (table) => ([
     index("brand_requests_status_idx").on(table.status),
     index("brand_requests_status_created_at_idx").on(
      table.status,
      table.createdAt
    ),
     index("brand_requests_admin_id_idx").on(table.userId),
  ])
);


export const features = pgTable(
  "features",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  },
  (features) => [index("idx_features_user").on(features.id)]
);

// Brand features table (many-to-many)
export const brandFeatures = pgTable(
  "brand_features",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    featureId: uuid("feature_id")
      .notNull()
      .references(() => features.id),
    purchasedAt: timestamp("purchased_at").defaultNow(),
  },
  (brandFeatures) => [
    index("idx_brand_features_id").on(brandFeatures.id),
    index("idx_brand_features_brandId").on(brandFeatures.brandId),
  ]
);
 