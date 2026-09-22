import { wishlist } from '@/db/schema';
import { users, usersProfile } from "./users";
import { brands, features, brandFeatures } from "./brands";
import { privacyPolicies, privacySections, privacyPoints } from "./privacyPolicy";
import {
  mediaRelations,
  brandFeaturesRelations,
  brandSubscriptionsRelations,
  brandsRelations,
  featuresRelations,
  membershipsRelations,
  productInteractionsRelations,
  productReviewsRelations,
  productsRelations,
  specialOffersRelations,
  testerActivityRelations,
  testerAgreementsRelations,
  testerInterestsRelations,
  testerOffersRelations,
  testerProfilesRelations,
  testerReferralsRelations,
  testerStatusRelations,
  testerTiersRelations,
  usersRelations,
} from "./relations";
import { memberships, brandSubscriptions } from "./memberships";
import { media } from "./media";
import { products, productInteractions, productReviews } from "./products";
import { rateLimits } from "./rateLimits";
import {
  productIdSequence,
  brandIdSequence,
  collectionIdSequence,
  testerIdSequence,
} from "./sequence";
import { specialOffers } from "./specialOffers";
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

export const schema = {
  testerActivity,
  testerAgreements,
  testerInterests,
  testerOffers,
  testerProfiles,
  testerReferrals,
  testerStatus,
  testerTiers,
  specialOffers,
  productIdSequence,
  brandIdSequence,
  collectionIdSequence,
  testerIdSequence,
  rateLimits,
  users,
  brands,
  usersProfile,
  features,
  brandFeatures,
  wishlist,
  privacyPolicies,
  privacySections,
  privacyPoints,
  mediaRelations,
  brandFeaturesRelations,
  brandSubscriptionsRelations,
  brandsRelations,
  featuresRelations,
  membershipsRelations,
  productInteractionsRelations,
  productReviewsRelations,
  productsRelations,
  specialOffersRelations,
  testerActivityRelations,
  testerAgreementsRelations,
  testerInterestsRelations,
  testerOffersRelations,
  testerProfilesRelations,
  testerReferralsRelations,
  testerStatusRelations,
  testerTiersRelations,
  usersRelations,
  memberships,
  brandSubscriptions,
  media,
  products,
  productInteractions,
  productReviews,
};

export type Database = typeof schema;
export * from "./wishlist";
export * from "./quickVote";
