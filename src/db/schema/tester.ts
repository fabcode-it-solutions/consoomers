import {
  uuid,
  varchar,
  pgTable,
  jsonb,
  timestamp,
  text,
  boolean,
  index,
  bigint,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  ActivityType,
  Gender,
  InterestCategory,
  LocationType,
  ReferralStatus,
  SampleRequestStatus,
  TesterTier,
  users,
} from "./users";
import { products } from "./products";
import { specialOffers } from "./specialOffers";
import { sql } from "drizzle-orm";
import { media } from "./media";

export const testerProfiles = pgTable(
  "tester_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopifyId: varchar("shopify_id", { length: 255 }),
    acceptsMarketing: varchar("accepts_marketing", { length: 100 }), 
    emailMarketingState: varchar("email_marketing_state", { length:100 }),
    profileImage: uuid("profileImage").references(() => media.id),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),

    // personal Information
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    country: varchar("country", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    locationType: varchar("location_type", {
      length: 20,
    }).$type<LocationType>(),
    householdComposition: text("household_composition"),
    householdIncome: varchar("household_income", { length: 100 }),
    gender: varchar("gender", { length: 20 }).$type<Gender>(),
    ageGroup: varchar("age_group", { length: 50 }),

    // Interests
    categoryInterested: jsonb("category_interested")
      .$type<string[]>()
      .notNull(),
    mainInterest: jsonb("main_interest").$type<string[] | null>().default(null),
    specificInterest: jsonb("specific_interest")
      .$type<string[] | null>()
      .default(null),
    beautySkinTone: varchar("beauty_skin_tone", { length: 100 }),
    beautySkinType: varchar("beauty_skin_type", { length: 100 }),
    hairColor: varchar("hair_color", { length: 100 }),
    hairType: varchar("hair_type", { length: 100 }),
    avgMonthlySpend: varchar("avg_monthly_spend", { length: 100 }),
    fitnessWellness: jsonb("fitness_wellness")
      .$type<string[] | null>()
      .default(null),
    primaryFocus: jsonb("primary_focus").$type<string[] | null>().default(null),
    foodBeverage: jsonb("food_beverage").$type<string[] | null>().default(null),
    foodAllergies: text("food_allergies"),
    kids: jsonb("kids").default([]),
    pets: jsonb("pets").default([]),
    hobbies: jsonb("hobbies").default([]),
    generalAgreement: boolean("general_agreement").default(false),
    over18: boolean("over_18").default(true),
    acceptedTerms: boolean("accepted_terms").default(false),
    aboutYou: text("about_you"),
    testerNum: bigint("tester_num", { mode: "number" })
      .notNull()
      .unique()
      .default(sql`nextval('tester_hash_id_seq')`),
    testerId: text("tester_hash_id")
      .notNull()
      .unique()
      .default(
        sql`'#TST' || LPAD(nextval('tester_hash_id_seq')::text, 8, '0')`
      ),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (testerProfiles) => [
    index("idx_tester_profiles_id").on(testerProfiles.id),
    index("idx_tester_profiles_userId").on(testerProfiles.userId),
  ]
);

// Tester interests table
export const testerInterests = pgTable(
  "tester_interests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    testerId: uuid("tester_id")
      .notNull()
      .references(() => testerProfiles.id),
    category: varchar("category", { length: 100 })
      .$type<InterestCategory>()
      .notNull(),
    extraInfo: jsonb("extra_info").default({}),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (testerInterests) => [
    index("idx_tester_interests_id").on(testerInterests.id),
    index("idx_tester_interests_testerId").on(testerInterests.testerId),
  ]
);

// Tester agreements table
export const testerAgreements = pgTable(
  "tester_agreements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    testerId: uuid("tester_id")
      .notNull()
      .references(() => testerProfiles.id, { onDelete: "cascade" }),
    likesProgram: boolean("likes_program").default(false),
    votesCampaign: boolean("votes_campaign").default(false),
    surveyCampaign: boolean("survey_campaign").default(false),
    tryTellCampaign: boolean("try_tell_campaign").default(false),
    generalAgreement: boolean("general_agreement").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (testerAgreements) => [
    index("idx_tester_agreements_id").on(testerAgreements.id),
    index("idx_tester_agreements_testerId").on(testerAgreements.testerId),
  ]
);

// Tester tiers table
export const testerTiers = pgTable(
  "tester_tiers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    testerId: uuid("tester_id")
      .notNull()
      .references(() => testerProfiles.id, { onDelete: "cascade" }),
    testerTier: varchar("name", { length: 50 })
      .$type<TesterTier>()
      .notNull()
      .default("explorer"),
    criteria: jsonb("criteria").default({}),
    score: varchar("score", { length: 50 }).default("0"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (testerTiers) => [index("idx_tester_tiers_id").on(testerTiers.id)]
);

// Tester status table
export const testerStatus = pgTable(
  "tester_status",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    testerId: uuid("tester_id")
      .notNull()
      .unique()
      .references(() => testerProfiles.id),
    tierId: uuid("tier_id")
      .notNull()
      .references(() => testerTiers.id),
    joinedAt: timestamp("joined_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (testerStatus) => [
    index("idx_tester_status_id").on(testerStatus.id),
    index("idx_tester_status_testerId").on(testerStatus.testerId),
  ]
);
export const testerActivity = pgTable(
  "tester_activity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    testerId: uuid("tester_id").notNull().references(() => testerProfiles.id),
    activityType: varchar("activity_type", { length: 30 }).$type<ActivityType>().notNull(),
    productId: uuid("product_id").references(() => products.id , { onDelete: "cascade" }),
    details: jsonb("details").default({}),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (testerActivity) => [
    index("idx_tester_activity_id").on(testerActivity.id),
    index("idx_tester_activity_testerId").on(testerActivity.testerId),
  ]
);



// Tester offers table
export const testerOffers = pgTable(
  "tester_offers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    testerId: uuid("tester_id")
      .notNull()
      .references(() => testerProfiles.id),
    offerId: uuid("offer_id")
      .notNull()
      .references(() => specialOffers.id),
    redeemed: boolean("redeemed").default(false),
    redeemedAt: timestamp("redeemed_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (testerOffers) => [
    index("idx_tester_offers_id").on(testerOffers.id),
    index("idx_tester_offers_testerId").on(testerOffers.testerId),
  ]
);

export const testerReferrals = pgTable(
  "tester_referrals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referrerId: uuid("referrer_id")
      .notNull()
      .references(() => testerProfiles.id),
    friendEmail: varchar("friend_email", { length: 255 }).notNull(),
    status: varchar("status", { length: 20 })
      .$type<ReferralStatus>()
      .default("pending"),
    joinedUserId: uuid("joined_user_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (testerReferrals) => [
    index("idx_tester_referrals_id").on(testerReferrals.id),
    index("idx_tester_referrals_referrerId").on(testerReferrals.referrerId),
  ]
);


export const sampleRequests = pgTable(
  "sample_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    testerId: uuid("tester_id") .notNull()
 .references(() => testerProfiles.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 })
      .$type<SampleRequestStatus>()
      .notNull()
      .default("pending"),
    shippingAddress: text("shipping_address"),
    notes: text("notes"),
    adminNotes: text("admin_notes"),
    requestedAt: timestamp("requested_at").defaultNow(),
    approvedAt: timestamp("approved_at"),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("delivered_at"),
    trackingNumber: varchar("tracking_number", { length: 255 }),
  },
  (sampleRequests) => [
    index("idx_sample_requests_id").on(sampleRequests.id),
    index("idx_sample_requests_testerId").on(sampleRequests.testerId),
    index("idx_sample_requests_productId").on(sampleRequests.productId),
    index("idx_sample_requests_status").on(sampleRequests.status),
  ]
);
