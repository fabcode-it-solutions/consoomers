"use client"
import React, { useEffect, useState } from "react";
import EditBrandProfileStepForm from "./EditBrandProfile";

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
  goals?: string[];
  handle: string;
  brandId: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  coverImage?: { id?: string; url: string; alt?: string };
  phoneNumber?: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
  brandProfile?: BrandProfile;
  phoneNumber?: string;
}

const EditBrandPage = ({ user }: { user: User }) => {
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrandProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔍 Fetching brand profile for user:", {
          userId: user.id,
          userEmail: user.email,
          userRole: user.role
        });
        const res = await fetch(`/api/auth/register/brand/profile?userId=${user.id}`);
        const data = await res.json();
        
        console.log("📦 Brand profile response:", {
          status: res.status,
          ok: res.ok,
          data: data,
          brandProfile: data?.brandProfile
        });
        
        if (res.ok && data.brandProfile) {
          setBrandProfile(data.brandProfile);
        } else {
          const errorMsg = data.error || "Failed to load brand profile";
          console.error("❌ Failed to fetch brand profile:", errorMsg);
          setError(errorMsg);
        }
      } catch (err) {
        console.error("❌ Error fetching brand profile:", err);
        setError("An error occurred while loading the profile");
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchBrandProfile();
    } else {
      setLoading(false);
      setError("User ID is missing");
      console.error("❌ No user ID provided to EditBrandPage");
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-180px)]">
        <div className="max-w-[720px] w-full mx-auto px-4">
          <div className="bg-white border border-gray-200 p-[40px]">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-180px)]">
        <div className="max-w-[720px] w-full mx-auto px-4">
          <div className="bg-white border border-red-200 p-[40px] text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Error Loading Profile
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!brandProfile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-180px)]">
        <div className="max-w-[720px] w-full mx-auto px-4">
          <div className="bg-white border border-gray-200 p-[40px] text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Brand Profile Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              This user does not have a brand profile set up yet.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <EditBrandProfileStepForm user={user} brandProfile={brandProfile} />;
};

export default EditBrandPage;