import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { brands } from "./brands";
import { products } from "./products";

export const wishlist = pgTable(
  "wishlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, {onDelete: "cascade",}),
    brandId: uuid("brand_id").references(() => brands.id, {onDelete: "cascade",}),
    entityType: varchar("entity_type", { length: 20 }).$type<"product" | "brand">().notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (wishlist) => [
    index("idx_wishlist_id").on(wishlist.id),
    index("idx_wishlist_user").on(wishlist.userId),
    index("idx_wishlist_product").on(wishlist.productId),
    index("idx_wishlist_brand").on(wishlist.brandId),
    unique("unique_wishlist_item").on(
      wishlist.userId,
      wishlist.entityType,
      wishlist.productId,
      wishlist.brandId
    ),
  ]
);
