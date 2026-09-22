import { relations } from "drizzle-orm";
import { brandFeatures, brands, features } from "./brands";
import { users, usersProfile } from "./users";
import { media } from "./media";
import {
  testerActivity,
  testerAgreements,
  testerInterests,
  testerOffers,
  testerProfiles,
  testerReferrals,
  testerStatus,
  testerTiers,
} from "./tester";
import { productInteractions, productReviews, products } from "./products";
import { brandSubscriptions, memberships } from "./memberships";
import { specialOffers } from "./specialOffers";
import { vote_options } from "./quickVote";

export const featuresRelations = relations(features, ({ many }) => ({
  brands: many(brandFeatures),
}));

export const brandFeaturesRelations = relations(brandFeatures, ({ one }) => ({
  brand: one(brands, {
    fields: [brandFeatures.brandId],
    references: [brands.id],
  }),
  feature: one(features, {
    fields: [brandFeatures.featureId],
    references: [features.id],
  }),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  brand: one(brands),
  testerProfile: one(testerProfiles),
  usersProfileImage: one(usersProfile),
  productInteractions: many(productInteractions),
  productReviews: many(productReviews),
  joinedReferrals: many(testerReferrals, {
    relationName: "joinedUser",
  }),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  user: one(users, {
    fields: [brands.userId],
    references: [users.id],
  }),
  // logo: one(media, {
  //   fields: [brands.logo],
  //   references: [media.id],
  //   relationName: "logo",
  // }),
  coverImage: one(media, {
    fields: [brands.coverImage],
    references: [media.id],
    relationName: "coverImage",
  }),
  subscriptions: many(brandSubscriptions),
  features: many(brandFeatures),
  products: many(products),
  specialOffers: many(specialOffers),
}));

export const membershipsRelations = relations(memberships, ({ many }) => ({
  subscriptions: many(brandSubscriptions),
}));

export const brandSubscriptionsRelations = relations(
  brandSubscriptions,
  ({ one }) => ({
    brand: one(brands, {
      fields: [brandSubscriptions.brandId],
      references: [brands.id],
    }),
    membership: one(memberships, {
      fields: [brandSubscriptions.membershipId],
      references: [memberships.id],
    }),
  })
);

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  interactions: many(productInteractions),
  activities: many(testerActivity),
  reviews: many(productReviews),
}));

export const productInteractionsRelations = relations(
  productInteractions,
  ({ one }) => ({
    product: one(products, {
      fields: [productInteractions.productId],
      references: [products.id],
    }),
    tester: one(users, {
      fields: [productInteractions.testerId],
      references: [users.id],
    }),
  })
);

export const specialOffersRelations = relations(
  specialOffers,
  ({ one, many }) => ({
    brand: one(brands, {
      fields: [specialOffers.brandId],
      references: [brands.id],
    }),
    testerOffers: many(testerOffers),
  })
);

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  tester: one(users, {
    fields: [productReviews.testerId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
}));
export const mediaRelations = relations(media, ({ many }) => ({
  userAvatars: many(users),
  brandLogos: many(brands, { relationName: "logo" }),
  brandCoverImages: many(brands, { relationName: "coverImage" }),
}));

export const testerProfilesRelations = relations(
  testerProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [testerProfiles.userId],
      references: [users.id],
    }),
    profileImage: one(media, {
      fields: [testerProfiles.profileImage],
      references: [media.id],
    }),
    interests: many(testerInterests),
    agreements: one(testerAgreements),
    status: one(testerStatus),
    activities: many(testerActivity),
    offers: many(testerOffers),
    referrals: many(testerReferrals),
  })
);

export const testerInterestsRelations = relations(
  testerInterests,
  ({ one }) => ({
    tester: one(testerProfiles, {
      fields: [testerInterests.testerId],
      references: [testerProfiles.id],
    }),
  })
);

export const testerAgreementsRelations = relations(
  testerAgreements,
  ({ one }) => ({
    tester: one(testerProfiles, {
      fields: [testerAgreements.testerId],
      references: [testerProfiles.id],
    }),
  })
);

export const testerTiersRelations = relations(testerTiers, ({ many }) => ({
  statuses: many(testerStatus),
}));

export const testerStatusRelations = relations(testerStatus, ({ one }) => ({
  tester: one(testerProfiles, {
    fields: [testerStatus.testerId],
    references: [testerProfiles.id],
  }),
  tier: one(testerTiers, {
    fields: [testerStatus.tierId],
    references: [testerTiers.id],
  }),
}));

export const testerActivityRelations = relations(testerActivity, ({ one }) => ({
  tester: one(testerProfiles, {
    fields: [testerActivity.testerId],
    references: [testerProfiles.id],
  }),
  product: one(products, {
    fields: [testerActivity.productId],
    references: [products.id],
  }),
}));

export const testerOffersRelations = relations(testerOffers, ({ one }) => ({
  tester: one(testerProfiles, {
    fields: [testerOffers.testerId],
    references: [testerProfiles.id],
  }),
  offer: one(specialOffers, {
    fields: [testerOffers.offerId],
    references: [specialOffers.id],
  }),
}));

export const testerReferralsRelations = relations(
  testerReferrals,
  ({ one }) => ({
    referrer: one(testerProfiles, {
      fields: [testerReferrals.referrerId],
      references: [testerProfiles.id],
    }),
    joinedUser: one(users, {
      fields: [testerReferrals.joinedUserId],
      references: [users.id],
      relationName: "joinedUser",
    }),
  })
);
export const vote_options_relations = relations(vote_options, ({ one }) => ({
  product: one(products, {
    fields: [vote_options.product_id],
    references: [products.id],
  }),
}));