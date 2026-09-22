import {uuid,varchar,pgTable,jsonb, timestamp, text, index, numeric,bigint,boolean,integer,} from "drizzle-orm/pg-core";
import { brands } from "./brands";
import { InteractionType, ReviewStatus, users } from "./users";
import { sql } from "drizzle-orm";
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id").notNull().references(() => brands.id),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }),
    tags: jsonb("tags"),
    media: jsonb("media"),
    handle: text("handle").notNull().unique(),
    brandLogo: jsonb("brandLogo"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    sampleRequestsEnabled: boolean("sample_requests_enabled").default(true),
    productNum: bigint("product_num", { mode: "number" })
    .notNull()
      .unique()
      .default(sql`nextval('product_hash_id_seq')`),
    productId: text("product_id")
      .notNull()
      .unique()
      .default(
        sql`'#PRO' || LPAD(nextval('product_hash_id_seq')::text, 8, '0')`
      ),
  },
  (products) => [
    index("idx_products_brand").on(products.brandId),
    index("idx_products_id").on(products.id),
    index("idx_handle_id").on(products.handle),
    index("idx_product_hash_id").on(products.productId),
  ]
);

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),

  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),

  // Basic info
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).unique(),

  // Pricing
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),

  // Inventory
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  trackInventory: boolean("track_inventory").default(true).notNull(),

  // Variant options (size, color etc.)
  options: jsonb("options").notNull().$type<Record<string, string>>(),

  // Media
  image: text("image"),

  // Physical attributes
  weight: numeric("weight", { precision: 10, scale: 2 }),
  dimensions: jsonb("dimensions").$type<{
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  }>(),

  // Status flags
  isActive: boolean("is_active").default(true).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),

  // 🔥 No sequence needed — generate readable ID with random hash
  variantId: text("variant_id")
    .notNull()
    .unique()
    .default(sql`'#VAR' || substr(md5(random()::text), 1, 10)`),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_variants_product").on(table.productId),
  index("idx_variants_id").on(table.id),
  index("idx_variants_sku").on(table.sku),
  index("idx_variant_hash_id").on(table.variantId),
]);


export const productOptions = pgTable("product_options", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(), 
  position: integer("position").default(0).notNull(), 
  values: jsonb("values").notNull().$type<string[]>(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_options_product").on(table.productId),
]);


// Product interactions table
export const productInteractions = pgTable(
  "product_interactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    testerId: uuid("tester_id")
      .notNull()
      .references(() => users.id),
    interactionType: varchar("interaction_type", { length: 20 })
      .$type<InteractionType>()
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (productInteractions) => [
    index("idx_interactions_product").on(productInteractions.productId),
    index("idx_interactions_tester").on(productInteractions.testerId),
  ]
);

// Product reviews table
export const productReviews = pgTable(
  "product_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    testerId: uuid("tester_id")
      .notNull()
      .references(() => users.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    images: uuid("images").array().default([]),     
    rate: varchar("rate", { length: 255 }).notNull(),
    review: varchar("review", { length: 255 }).notNull(),
    status: varchar("status", { length: 20 })
      .$type<ReviewStatus>()
      .default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (productReviews) => [
    index("idx_referrals_product_id").on(productReviews.productId),
    index("idx_referrals_tester_id").on(productReviews.testerId),
    index("idx_referrals_status").on(productReviews.status),
  ]
);
