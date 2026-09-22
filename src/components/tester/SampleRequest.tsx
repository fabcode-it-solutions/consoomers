/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import CardLayout from "../ui/CardLayout";
import CustomSwiper from "../ui/Slider";

interface SampleRequest {
  request: {
    id: string;
    status: string;
    requestedAt: Date;
    approvedAt?: Date;
    shippedAt?: Date;
    deliveredAt?: Date;
    trackingNumber?: string;
    notes?: string;
  };
  product: {
    id: string;
    name: string;
    handle: string;
    media?: any;
    price?: string;
  };
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: "⏳",
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-800",
    icon: "✅",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: "❌",
  },
  shipped: {
    label: "Shipped",
    color: "bg-blue-100 text-white",
    icon: "📦",
  },
  delivered: {
    label: "Delivered",
    color: "bg-purple-100 text-purple-800",
    icon: "🎉",
  },
};
const SampleRequests: React.FC<{ testerId?: string }> = ({ testerId }) => {
  const [requests, setRequests] = useState<SampleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadRequests();
  }, [testerId]);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = testerId
        ? `/api/dashboard/sample-request?testerId=${testerId}`
        : "/api/dashboard/sample-request";
      
      console.log("📡 Fetching sample requests from:", url);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
   
      
      setRequests(data.requests || []);
    } catch (error) {
      console.error("❌ Failed to load sample requests:", error);
      setError(error instanceof Error ? error.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((r) => r.request.status === filter);

  const getProductImage = (media: any) => {
    if (!media) return "/placeholder-product.png";
    if (Array.isArray(media) && typeof media[0] === "string") {
      return media[0];
    }
    if (Array.isArray(media) && media.length > 0) {
      return media[0].url || media[0].src || "/placeholder-product.png";
    }
    return "/placeholder-product.png";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Requests
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadRequests}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      {/* Header - Optional, currently commented */}
      {/* <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Sample Requests</h2>
        <p className="text-gray-600 mt-1">
          {testerId 
            ? "Viewing tester's sample requests" 
            : "Track your sample requests and their status"}
        </p>
      </div> */}

      {/* Status Filter - Optional, currently commented */}
      {/* <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "all"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({requests.length})
          </button>
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = requests.filter(
              (r) => r.request.status === status
            ).length;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === status
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {config.icon} {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div> */}

      {/* Requests List */}
      <div className="p-6">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No sample requests yet
            </h3>
            <p className="text-gray-600">
              {testerId 
                ? "This tester hasn't requested any samples yet."
                : "Start requesting samples to test amazing products!"}
            </p>
          </div>
        ) : (
          <CustomSwiper
            slidesPerView={3}
            spaceBetween={20}
            showNavigation={false}
          >
            {filteredRequests.map((item) => {
              // Safely get status config with fallback
              const status = statusConfig[item.request.status as keyof typeof statusConfig] || {
                label: item.request.status || "Unknown",
                color: "bg-gray-100 text-gray-800",
                icon: "📋",
              };

              return (
                <CardLayout
                  key={item.request.id}
                  title={item.product.name}
                  image1={getProductImage(item.product.media)}
                  price={item.product.price}
                  href={`/products/${item.product.handle}`}
                  status={status.label}
                  statusBg={status.color}
                />
              );
            })}
          </CustomSwiper>
        )}
      </div>
    </div>
  );
};

export default SampleRequests;