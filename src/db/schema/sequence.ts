import { pgSequence } from "drizzle-orm/pg-core";

export const productIdSequence = pgSequence("product_hash_id_seq", {
  startWith: 1,
  minValue: 1,
  maxValue: 9999999999,
  cycle: false,
  cache: 1000,
  increment: 1,
});

export const brandIdSequence = pgSequence("brand_hash_id_seq", {
  startWith: 1,
  minValue: 1,
  maxValue: 9999999999,
  cycle: false,
  cache: 1000,
  increment: 1,
});

export const collectionIdSequence = pgSequence("collection_hash_id_seq", {
  startWith: 1,
  minValue: 1,
  maxValue: 9999999999,
  cycle: false,
  cache: 1000,
  increment: 1,
});

export const testerIdSequence = pgSequence("tester_hash_id_seq", {
  startWith: 1,
  minValue: 1,
  maxValue: 9999999999,
  cycle: false,
  cache: 1000,
  increment: 1,
});
