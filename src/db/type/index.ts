import { users } from "../schema/users";
import { brandFeatures, brands, features } from "../schema/brands";
import { media } from "../schema/media";
import { brandSubscriptions, memberships } from "../schema/memberships";
import {
  productInteractions,
  productReviews,
  products,
} from "../schema/products";
import { rateLimits } from "../schema/rateLimits";
import { specialOffers } from "../schema/specialOffers";
import {
  testerActivity,
  testerAgreements,
  testerInterests,
  testerOffers,
  testerProfiles,
  testerReferrals,
  testerStatus,
  testerTiers,
} from "../schema/tester";

// Table Types - Select (for reading from database)
export type Media = typeof media.$inferSelect;
export type User = typeof users.$inferSelect & {
  avatarUrl?: string;
  profileImage?: string;
};
export type Brand = typeof brands.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type BrandSubscription = typeof brandSubscriptions.$inferSelect;
export type Feature = typeof features.$inferSelect;
export type BrandFeature = typeof brandFeatures.$inferSelect;
export type Product = typeof products.$inferSelect;
export type TesterProfile = typeof testerProfiles.$inferSelect;
export type ProductInteraction = typeof productInteractions.$inferSelect;
export type TesterInterest = typeof testerInterests.$inferSelect;
export type TesterAgreement = typeof testerAgreements.$inferSelect;
export type TesterTier = typeof testerTiers.$inferSelect;
export type TesterStatus = typeof testerStatus.$inferSelect;
export type TesterActivity = typeof testerActivity.$inferSelect;
export type SpecialOffer = typeof specialOffers.$inferSelect;
export type TesterOffer = typeof testerOffers.$inferSelect;
export type TesterReferral = typeof testerReferrals.$inferSelect;
export type RateLimit = typeof rateLimits.$inferSelect;
export type ProductReview = typeof productReviews.$inferSelect;

// Table Types - Insert (for inserting into database)
export type NewMedia = typeof media.$inferInsert;
export type NewUser = typeof users.$inferInsert & {
  avatarUrl?: string;
};
export type NewBrand = typeof brands.$inferInsert;
export type NewMembership = typeof memberships.$inferInsert;
export type NewBrandSubscription = typeof brandSubscriptions.$inferInsert;
export type NewFeature = typeof features.$inferInsert;
export type NewBrandFeature = typeof brandFeatures.$inferInsert;
export type NewProduct = typeof products.$inferInsert;
export type NewTesterProfile = typeof testerProfiles.$inferInsert;
export type NewProductInteraction = typeof productInteractions.$inferInsert;
export type NewTesterInterest = typeof testerInterests.$inferInsert;
export type NewTesterAgreement = typeof testerAgreements.$inferInsert;
export type NewTesterTier = typeof testerTiers.$inferInsert;
export type NewTesterStatus = typeof testerStatus.$inferInsert;
export type NewTesterActivity = typeof testerActivity.$inferInsert;
export type NewSpecialOffer = typeof specialOffers.$inferInsert;
export type NewTesterOffer = typeof testerOffers.$inferInsert;
export type NewTesterReferral = typeof testerReferrals.$inferInsert;
export type NewRateLimit = typeof rateLimits.$inferInsert;
export type NewProductReview = typeof productReviews.$inferInsert;

// export type Media = {
//   id: number;
//   type: "image" | "video" | "audio" | string;
//   url: string;
//   altText: string;
//   isPublic: boolean;
//   isArchived: boolean;
//   displayOrder: number;
//   userId: number;
//   size: string;
//   width: number;
//   height: number;
//   format: string;
//   createdAt: string;
//   updatedAt: string;
// };
export type UploadFileType = {
  id?: number;
  alt?: string;
  url?: string;
  order?: number;
  type?: string;
};
export interface PaginationState {
  page?: number;
  currentPage?: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}
