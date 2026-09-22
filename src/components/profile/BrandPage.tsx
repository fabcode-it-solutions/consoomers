/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import BrandProfileCard from "./BrandProfile";

// Brand profile interface
export interface BrandProfile {
  id: string;
  userId: string;
  name: string;
  brandName?: string;
  website?: string;
  industry?: string;
  position?: string;
  category?: string;
  sellingInUS?: string;
  goals?: string[];
  handle: string;
  brandId: string;
  brandNum: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  coverImage?: {
    id: string;
    url: string;
    alt?: string;
    type?: string;
  };
  preferences?: any;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
  brandProfile?: BrandProfile;
}

const BrandPage = ({ user }: { user: User }) => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandProfile = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const res = await fetch(`/api/auth/register/brand/profile?userId=${user.id}`);
        const data = await res.json();
        console.log(data,"data")
        if (res.ok && data.brandProfile) {
          setBrandProfile(data.brandProfile);
        }
      } catch (err) {
        console.error("Error loading brand profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandProfile();
  }, [user?.id, dispatch]);

  // console.log("brand user data -->", user);
  // console.log("brand profile -->", brandProfile);
  // console.log("session -->", session);

  const currentUser =
    session?.user?.id && session?.user?.role
      ? {
          id: session.user.id,
          role: session.user.role,
        }
      : undefined;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-100 p-8">
          <div className="animate-pulse">
            <div className="h-32 w-32 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!brandProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-100 p-8 text-center">
          <p className="text-gray-500">Brand profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <BrandProfileCard
      profile={brandProfile}
      userEmail={user.email}
      userName={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
      currentUser={currentUser}
    />
  );
};

export default BrandPage;