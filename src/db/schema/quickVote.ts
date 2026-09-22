import { pgTable, uuid, jsonb, timestamp, } from "drizzle-orm/pg-core";
import { products } from "./products";



export const quick_votes = pgTable("quick_votes", {
  id: uuid("id").defaultRandom().primaryKey(),
  product_id: uuid("product_id").notNull(),
  user_id: uuid("user_id"),
  selected_options: jsonb("selected_options").notNull(),
  metadata: jsonb("metadata").default("{}"),
  created_at: timestamp("created_at").defaultNow(),
});
export const vote_options = pgTable("vote_options", {
  id: uuid("id").defaultRandom().primaryKey(),
  product_id: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  options: jsonb("options").notNull(), 
  metadata: jsonb("metadata").default("{}"),
  created_at: timestamp("created_at").defaultNow(),
});

