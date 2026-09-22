"use client";
import React, { useState, useEffect } from "react";
import {  
  CalendarDays,
  Heart,
  UserRoundCog,
  MapPin,
  Vote,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CardLayout from "./CardLayout";
import CustomSwiper from "./Slider";
import WishlistTooltip from "../sections/Wishlist/WishlistTooltip";
import { TesterProfile } from "@/db/type";
import SampleRequests from "../tester/SampleRequest";
import PendingSurveys from "../sections/ProductDetail/PendingSurvey";


const tabs = [
  { name: "Like", icon: <Heart size={18} /> },
  { name: "Voted", icon: <Vote size={18} /> },
  { name: "Sample Requests", icon: <Vote size={18} /> },
  { name: "Surveys", icon: <FileText size={18} /> },
];

interface ProfileCardProps {
  profiles: TesterProfile & { testerTier?: string };
  currentUser?: {
    id: string;
    role: string;
  };
}

interface VotedProduct {
  voteId: string;
  productName: string;
  price: string;
  category?: string;
  media?: string[];
  handle?: string;
  selectedOptions?: string[];
}

const TesterBadge = ({ tier }: { tier?: string }) => {
  if (!tier) return null;

  const tierConfig: Record<
    string,
    { bg: string; text: string; icon: string; label: string }
  > = {
    explorer: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: "🔍",
      label: "Explorer",
    },
    trendsetter: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      icon: "⭐",
      label: "Trendsetter",
    },
    insider: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      icon: "👑",
      label: "Insider",
    },
  };

  const config = tierConfig[tier.toLowerCase()] || tierConfig.explorer;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-2 ${config.bg} ${config.text} font-medium text-sm border border-current border-opacity-20`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
};

export default function ProfileCard({
  profiles,
  currentUser,
}: ProfileCardProps) {
  const [selectedTab, setSelectedTab] = useState("Like");
  const [votedProducts, setVotedProducts] = useState<VotedProduct[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(false);

  const canViewTabs =
    currentUser?.id === profiles.userId || currentUser?.role === "admin";

  const formatDate = (isoString: string | Date) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  useEffect(() => {
    const fetchVotedProducts = async () => {
      if (!profiles?.userId) return;
      setLoadingVotes(true);

      try {
        const res = await fetch(`/api/quickvotes?userId=${profiles.userId}`);
        const data = await res.json();

        if (res.ok && Array.isArray(data.votedProducts)) {
          setVotedProducts(data.votedProducts);
        }
      } catch (err) {
        console.error("Error loading voted products:", err);
      } finally {
        setLoadingVotes(false);
      }
    };

    if (selectedTab === "Voted" && canViewTabs) {
      fetchVotedProducts();
    }
  }, [selectedTab, profiles.userId, canViewTabs]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-gray-100">
        <div className="px-6 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Image
                src={profiles.profileImage || "/assets/images/user.png"}
                alt={`${profiles.firstName} ${profiles.lastName}'s profile image`}
                width={128}
                height={128}
                className="h-32 w-32 object-cover"
              />
              <div className="mb-2">
                <div className="flex gap-4">
                  <h1 className="text-3xl font-bold text-gray-900 capitalize">
                    {profiles.firstName} {profiles.lastName}
                  </h1>
                  {profiles.testerTier && (
                    <TesterBadge tier={profiles.testerTier} />
                  )}
                </div>
                <p className="text-gray-500 mt-1">{profiles.email}</p>
              </div>
            </div>

            {canViewTabs && (
              <Link
                href={`/profile/${profiles.userId}/edit`}
                className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white font-medium shadow-sm hover:bg-blue-500/80"
              >
                <UserRoundCog size={18} />
                <span>Edit Profile</span>
              </Link>
            )}
          </div>

          {/* About */}
          {profiles.aboutYou && (
            <p className="text-gray-700 leading-relaxed mb-6 max-w-3xl">
              {profiles.aboutYou}
            </p>
          )}

          {/* Location + Joined */}
          <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
            {profiles.state && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="p-1.5 bg-green-50">
                  <MapPin size={16} className="text-green-600" />
                </div>
                <span className="font-medium">{profiles.state}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <div className="p-1.5 bg-blue-50">
                <CalendarDays size={16} className="text-blue-600" />
              </div>
              <span className="font-medium">
                Joined {profiles.createdAt ? formatDate(profiles.createdAt) : "Unknown"}
              </span>
            </div>
          </div>

          {/* Interests */}
          {(profiles.categoryInterested ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profiles.categoryInterested.map((interest) => (
                <span
                  key={interest}
                  className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------------------- TABS ---------------------- */}
      {canViewTabs && (
        <div className="mt-8 bg-white border border-gray-100">
          <div className="p-6 sm:p-8">
            {/* Tab Switcher */}
            <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-md">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium transition-all ${
                    selectedTab === tab.name
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setSelectedTab(tab.name)}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </div>

            {/* ---------------------- TAB CONTENT ---------------------- */}
            <div className="mt-8">
              {selectedTab === "Like" && (
                <WishlistTooltip
                  mode="inline"
                  profileUserId={profiles.userId}
                />
              )}

              {/* ---------------------- VOTED TAB ---------------------- */}
              {selectedTab === "Voted" && (
                <>
                  {loadingVotes ? (
                    <p className="text-gray-500 text-center py-10">
                      Loading voted products...
                    </p>
                  ) : votedProducts.length > 0 ? (
                    <CustomSwiper slidesPerView={3} spaceBetween={24}>
                      {votedProducts.map((product) => (
                        <div
                          key={product.voteId}
                          className="flex flex-col gap-2"
                        >
                          <CardLayout
                            title={product.productName}
                            image1={
                              product.media?.[0] ||
                              "/assets/images/default-product.webp"
                            }
                            image2={product.media?.[1] || product.media?.[0]}
                            price={product.price}
                            category={product.category}
                            href={`/products/${product.handle}`}
                            imgHeight="max-h-[350px]"
                          />

                          {/* Selected vote options */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {product.selectedOptions?.map((opt) => (
                              <span
                                key={opt}
                                className="px-3 py-1 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded"
                              >
                                {opt.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CustomSwiper>
                  ) : (
                    <p className="text-gray-500 text-center py-10">
                      No voted products found.
                    </p>
                  )}
                </>
              )}

              {selectedTab === "Sample Requests" && (
                <SampleRequests testerId={profiles.id} />
              )}

              {selectedTab === "Pending Surveys" && (
                <PendingSurveys testerId={profiles.id} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
