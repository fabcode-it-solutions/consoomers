/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Button from "@/components/ui/Button";
import CardLayout from "@/components/ui/CardLayout";
import CustomSwiper from "@/components/ui/Slider";
import React, { useEffect, useState, useCallback } from "react";

interface SurveyItem {
  product: {
    id: string;
    name: string;
    handle: string;
    media?: any;
    price?: string;
  };
  reviewed: boolean;
  reviewStatus: string | null;
}

const SurveyProducts: React.FC<{ testerId: string }> = ({ testerId }) => {
  const [items, setItems] = useState<SurveyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "completed">("pending");

  // DEBUG: Log testerId on mount
  useEffect(() => {
    console.log("🆔 SurveyProducts received testerId:", testerId);
  }, [testerId]);

  const loadSurveyProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    console.log("🔄 loadSurveyProducts called with testerId:", testerId);

    try {
      // 1. Fetch sample requests
      const sampleUrl = `/api/dashboard/sample-request?testerId=${testerId}`;
      console.log("📡 Fetching sample requests:", sampleUrl);
      
      const res = await fetch(sampleUrl);

      if (!res.ok) throw new Error("Failed to load survey products");
      const data = await res.json();

      const sampleRequests = data.requests || [];
      console.log("📦 Sample Requests received:", sampleRequests.length);

      // 2. For each product, check if user has submitted a review
      const statusPromises = sampleRequests.map(async (req: any) => {
        const statusUrl = `/api/dashboard/pending-survey?testerId=${testerId}&productId=${req.product.id}`;
        console.log("🔍 Checking survey status:", {
          testerId,
          productId: req.product.id,
          url: statusUrl
        });

        const statusRes = await fetch(statusUrl);

        if (!statusRes.ok) {
          console.error("❌ Status check failed for product:", req.product.id);
          return {
            product: req.product,
            reviewed: false,
            reviewStatus: null,
          };
        }

        const statusData = await statusRes.json();
        console.log("✅ Status API Response for product:", req.product.id, statusData);

        return {
          product: req.product,
          reviewed: Boolean(statusData.reviewed),
          reviewStatus: statusData.reviewStatus || null,
        } as SurveyItem;
      });

      const results = await Promise.all(statusPromises);
      console.log(" Final Survey Items:", results);

      setItems(results);
    } catch (err: any) {
      console.error("Survey Load Error:", err);
      setError(err?.message || "Something went wrong loading survey items.");
    } finally {
      setLoading(false);
    }
  }, [testerId]);

  useEffect(() => {
    if (!testerId) {
      console.warn(" No testerId provided to SurveyProducts");
      return;
    }

    loadSurveyProducts();

    const onUpdate = () => {
      console.log(" survey-updated event received → reloading...");
      loadSurveyProducts();
    };

    window.addEventListener("survey-updated", onUpdate);
    return () => window.removeEventListener("survey-updated", onUpdate);
  }, [testerId, loadSurveyProducts]);

  const pendingItems = items.filter((i) => !i.reviewed);
  const completedItems = items.filter((i) => i.reviewed);

  const getProductImage = (media: any) => {
    if (!media) return "/placeholder-product.png";

    if (Array.isArray(media)) {
      if (typeof media[0] === "string") return media[0];
      if (media[0]?.url) return media[0].url;
      if (media[0]?.src) return media[0].src;
    }

    return "/placeholder-product.png";
  };

  const getStatusDisplay = (reviewStatus: string | null, reviewed: boolean) => {
    if (!reviewed) return "Pending ";

    switch ((reviewStatus || "").toLowerCase()) {
      case "pending":
        return "Under Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Completed";
    }
  };
  const getStatusColor = (reviewStatus: string | null, reviewed: boolean) => {
    if (!reviewed) return "bg-yellow-100 text-yellow-800";

    switch ((reviewStatus || "").toLowerCase()) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className="bg-white ">
      <div className="p-6">
        {/* <h2 className="text-xl font-bold text-gray-800 mb-4">
          Survey Products
        </h2> */}

        {/* DEBUG INFO - Remove after fixing
        <div className="mb-4 p-3 bg-gray-100 rounded text-xs font-mono">
          <div><strong>Debug Info:</strong></div>
          <div>TesterId: {testerId}</div>
          <div>Total Items: {items.length}</div>
          <div>Pending: {pendingItems.length}</div>
          <div>Completed: {completedItems.length}</div>
        </div> */}

        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 text-sm font-medium transition ${
              filter === "pending"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pending ({pendingItems.length})
          </Button>

          <Button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 text-sm font-medium transition ${
              filter === "completed"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed ({completedItems.length})
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : (filter === "pending" && pendingItems.length === 0) ||
          (filter === "completed" && completedItems.length === 0) ? (
          <div className="text-center text-gray-600 py-12">
            <div className="text-6xl mb-4">
              {filter === "pending" ? "📝" : "🎉"}
            </div>
            <h3 className="text-xl font-semibold">
              {filter === "pending"
                ? "No pending surveys"
                : "No completed surveys"}
            </h3>
          </div>
        ) : (
          <div className="p-2">
            <CustomSwiper slidesPerView={3} spaceBetween={20} showNavigation={false}>
              {(filter === "pending" ? pendingItems : completedItems).map(
                (item) => (
                  <CardLayout
                    key={item.product.id}
                    title={item.product.name}
                    image1={getProductImage(item.product.media)}
                    price={item.product.price}
                    href={`/products/${item.product.handle}`}
                    status={` ${getStatusDisplay(
                      item.reviewStatus,
                      item.reviewed
                    )}`}
                    statusBg={getStatusColor(
                      item.reviewStatus,
                      item.reviewed
                    )}
                  />
                )
              )}
            </CustomSwiper>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyProducts;