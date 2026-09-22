/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import {
  Bookmark,
  CalendarDays,
  Heart,
  UserRoundCog,
  MapPin,
  Building2,
  Globe,
  Target,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CustomSwiper from "../ui/Slider";
import CardLayout from "../ui/CardLayout";

const tabs = [
  { name: "Products", icon: <Image src = "/assets/images/productIcon.png" alt = "" width = {18} height = {18} />},
 
];

interface BrandProfile {
  id: string;
  userId: string;
  name: string;
  brandName?: string;
  website?: string;
  industry?: string;
  position?: string;
  category?: string;
  sellingInUS?: string;
  goals?: string[] | string; 
  handle: string;
  brandId: string;
  createdAt: string | Date;
  coverImage?: {
    url: string;
    alt?: string;
  };
}

interface BrandProfileCardProps {
  profile: BrandProfile;
  userEmail?: string;
  userName?: string;
  currentUser?: {
    id: string;
    role: string;
  };
}

interface Product {
  id: string;
  name: string;
  price: string;
  category?: string;
  media?: string[];
  handle?: string;
}

export default function BrandProfileCard({
  profile,
  userEmail,
  userName,
  currentUser,
}: BrandProfileCardProps) {
  const [selectedTab, setSelectedTab] = useState("Products");
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns] = useState<any[]>([]);

  const canViewTabs = currentUser?.id === profile.userId || currentUser?.role === "admin";
  const formatDate = (isoString: string | Date) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };
  const normalizeGoals = (goals?: string[] | string): string[] => {
    if (!goals) return [];
    if (Array.isArray(goals)) return goals;
    if (typeof goals === 'string') {
   
      try {
        const parsed = JSON.parse(goals);
        return Array.isArray(parsed) ? parsed : [goals];
      } catch {
     
        return goals.includes(',') ? goals.split(',').map(g => g.trim()) : [goals];
      }
    }
    return [];
  };

  const goalsArray = normalizeGoals(profile.goals);

  console.log(products, "products");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const brandId = profile?.brandId || profile?.id;
        const userRole = currentUser?.role || "user";

        if (!brandId) return;

        const url =
          userRole === "admin"
            ? `/api/product/get-product?brandId=${profile.id}`
            : `/api/product/get-product`;

        const res = await fetch(url);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, [profile?.brandId, profile?.id, currentUser?.role]);

  console.log("Admin Fetch Debug:", {
    role: currentUser?.role,
    brandId: profile?.brandId,
    profileId: profile?.id,
    userId: profile?.userId,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-gray-100">
        {profile.coverImage?.url && (
          <div className="w-full h-48 sm:h-64 relative">
            <Image
              src={profile.coverImage.url}
              alt={profile.coverImage.alt || "Brand cover"}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="px-6 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              <div className="relative">
                <Image
                  className="relative h-32 w-32 object-cover"
                  src="/assets/images/user.png"
                  width={128}
                  height={128}
                  alt="Profile"
                />
              </div>
              <div className="mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.brandName || profile.name}
                </h1>
                {userEmail && <p className="text-gray-500 mt-1">{userEmail}</p>}
                {userName && (
                  <p className="text-sm text-gray-400 mt-1 font-mono">
                    {userName}
                  </p>
                )}
              </div>
            </div>

            {canViewTabs && (
              <Link
                href={`/profile/${profile.userId}/edit`}
                className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white transition-colors duration-200 font-medium shadow-sm hover:bg-blue-600"
              >
                <UserRoundCog size={18} />
                <span>Edit Profile</span>
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
            {profile.position && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="p-1.5 bg-purple-50">
                  <UserRoundCog size={16} className="text-purple-600" />
                </div>
                <span className="font-medium">{profile.position}</span>
              </div>
            )}

            {profile.category && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="p-1.5 bg-green-50">
                  <MapPin size={16} className="text-green-600" />
                </div>
                <span className="font-medium">{profile.category}</span>
              </div>
            )}

            {profile.website && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="p-1.5 bg-blue-50">
                  <Globe size={16} className="text-blue-600" />
                </div>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-blue-600 transition-colors"
                >
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <div className="p-1.5 bg-orange-50">
                <CalendarDays size={16} className="text-orange-600" />
              </div>
              <span className="font-medium">
                Joined {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>

          {profile.sellingInUS && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-3">
                <Building2 size={20} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    US Market Status
                  </p>
                  <p className="text-gray-700">{profile.sellingInUS}</p>
                </div>
              </div>
            </div>
          )}

          {goalsArray.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Target size={20} className="text-gray-700" />
                <h3 className="font-semibold text-gray-900">Brand Goals</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {goalsArray.map((goal, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100 hover:border-blue-200 transition-colors"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )} 

          {profile.industry && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                {profile.industry}
              </span>
            </div>
          )}
        </div>
      </div>

      {canViewTabs && (
        <div className="mt-8 bg-white border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-1 bg-gray-100 p-5 ">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 font-medium text-sm transition-all duration-200 ${
                    selectedTab === tab.name
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setSelectedTab(tab.name)}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-8">
              {selectedTab === "Products" ? (
                <>
                  {products.length > 0 ? (
                    <CustomSwiper slidesPerView={3} spaceBetween={24}>
                      {products.map((product) => (
                        <CardLayout
                          key={product.id}
                          title={product.name}
                          image1={
                            product.media?.[0] ||
                            "/assets/images/default-product.webp"
                          }
                          image2={product.media?.[1] || product.media?.[0]}
                          price={product.price}
                          imgHeight="max-h-[350px]"
                          category={product.category}
                          href={`/products/${product.handle}`}
                        />
                      ))}
                    </CustomSwiper>
                  ) : (
                    <div className="text-center py-12">
                      <Building2
                        size={48}
                        className="mx-auto text-gray-300 mb-4"
                      />
                      <p className="text-gray-500 text-lg font-medium">
                        No products yet
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Products will appear here once added
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {campaigns.length > 0 ? (
                    <CustomSwiper slidesPerView={3} spaceBetween={24}>
                      {campaigns.map((campaign, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 p-4 "
                        >
                          <h3 className="font-semibold text-gray-900">
                            {campaign.name}
                          </h3>
                          <p className="text-gray-600 text-sm mt-2">
                            {campaign.description}
                          </p>
                        </div>
                      ))}
                    </CustomSwiper>
                  ) : (
                    <div className="text-center py-12">
                      <Bookmark
                        size={48}
                        className="mx-auto text-gray-300 mb-4"
                      />
                      <p className="text-gray-500 text-lg font-medium">
                        No campaigns yet
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Campaigns will appear here once created
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}