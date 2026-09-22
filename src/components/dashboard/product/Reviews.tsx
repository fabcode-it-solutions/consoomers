/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useCallback, useEffect } from "react";
import PageHeader from "../PageHeader";
import { SerchField } from "@/components/ui/dashboard/Search";
import {
  Star,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Calendar,
  User,
  Package,
  ThumbsUp,
  MoreHorizontal,
  X,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useDebounce } from "@/hooks/useDebounce";
import DeleteConfirmationDialog from "@/components/ui/dashboard/ConfirmationPopup";
import Pagination from "@/components/ui/dashboard/Pagination";
import DialogPopup from "@/components/ui/DialogPopup";
import Spinner from "@/components/ui/Loader";


interface Review {
  id: string;
  testerId: string;
  productId: string;
  rate: string;
  review: string;
  images: Array<{
    id: string;
    src: string;
    alt: string;
  }>;
  helpfulCount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  testerName: string;
  productName?: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-900/30 text-yellow-400 border border-yellow-700",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "bg-green-900/30 text-green-400 border border-green-700",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-900/30 text-red-400 border border-red-700",
    icon: XCircle,
  },
};

const ITEMS_PER_PAGE = 20;

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteAction, setDeleteAction] = useState<{
    id: string;
    action: "approved" | "rejected";
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch reviews
  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/reviews");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReviews(data.reviews || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);
  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    },
    500,
    [searchTerm]
  );

  useEffect(() => {
    let filtered = reviews;

    if (filterStatus !== "all") {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.testerName
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          r.review
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          (r.productName &&
            r.productName
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase()))
      );
    }

    setFilteredReviews(filtered);
    setCurrentPage(1);
  }, [reviews, filterStatus, debouncedSearchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const updateReviewStatus = async (reviewId: string, status: string) => {
    try {
      const res = await fetch("/api/dashboard/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, status: status as any } : r
        )
      );
      if (selectedReview?.id === reviewId) {
        setSelectedReview((prev) =>
          prev ? { ...prev, status: status as any } : null
        );
      }

      setShowDetailModal(false);
      setOpenDropdown(null);
      setDeleteConfirmId(null);
      setIsDeleting(false);

    
      setTimeout(() => loadReviews(), 500);
    } catch (error) {
      console.error("Error updating review:", error);
      setIsDeleting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (deleteAction) {
      setIsDeleting(true);
      await updateReviewStatus(deleteAction.id, deleteAction.action);
      setDeleteAction(null);
    }
  };
  const handleQuickAction = (review: Review, action: string) => {
    if (action === "approved") {
      setDeleteAction({ id: review.id, action: "approved" });
      setDeleteConfirmId(review.id);
    } else if (action === "rejected") {
      setDeleteAction({ id: review.id, action: "rejected" });
      setDeleteConfirmId(review.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: string) => {
    const rate = parseFloat(rating);
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rate
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (

      <div className="flex justify-center items-center w-full">
        <Spinner className="w-12 h-12 mt-10" />
      </div>
      // <div className="p-6 bg-[#1a2332] min-h-screen">
      //   <div className="animate-pulse space-y-4">
      //     {[1, 2, 3].map((i) => (
      //       <div key={i} className="h-24 bg-slate-700 rounded-lg"></div>
      //     ))}
      //   </div>
      // </div>
    );
  }

  return (
    // <div className="p-6 bg-[#1a2332] min-h-screen">
    //   <div className="max-w-7xl mx-auto">
    //     {/* Header */}
    //     <div className="mb-8">
    //       <h1 className="text-3xl font-bold text-slate-100 mb-2">
    //         Product Reviews
    //       </h1>
    //       <p className="text-slate-400">
    //         Manage and moderate product reviews from testers
    //       </p>
    //     </div>
    <div className="bg-dark-100">
      <div className="mx-auto p-4">
        <PageHeader heading="Product Reviews" describe="Manage and moderate product reviews from testers" />

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Reviews",
              count: reviews.length,
              color: "bg-blue-500",
            },
            {
              label: "Pending",
              count: reviews.filter((r) => r.status === "pending").length,
              color: "bg-yellow-500",
            },
            {
              label: "Approved",
              count: reviews.filter((r) => r.status === "approved").length,
              color: "bg-green-500",
            },
            {
              label: "Rejected",
              count: reviews.filter((r) => r.status === "rejected").length,
              color: "bg-red-500",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">
                    {stat.count}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg`}></div>
              </div>
            </div>
          ))}
        </div> */}

        {/* Controls */}
        {/* <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by tester, product, or review text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            /> */}
             <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
                      <div className="flex-1">
                         <SerchField
                                      name="search"
                                      type="text"
                                      placeholder="Search by tester, product, or review text..."
                                      value={searchTerm}
                                       onChange={(e) => setSearchTerm(e.target.value)}
                                    />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
           className="px-4 py-2 bg-slate-800 border border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
         
        </div>

        {/* Reviews Table */}
        <div className="bg-slate-800 border border-slate-700 overflow-hidden">
          {paginatedReviews.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No reviews found</p>
            </div>
          ) : (
             <div className="overflow-x-auto max-tab-lg:hidden">
              <table className="w-full">
                <thead className="bg-gray-5/10 border-b border-[#334155]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Tester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Review
                    </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Date
                    </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {paginatedReviews.map((review) => {
                    const status =
                      statusConfig[review.status as keyof typeof statusConfig];
                    const StatusIcon = status.icon;

                    return (
                      <tr
                        key={review.id}
                        className="hover:bg-slate-700/50 transition"
                      >
                        {/* <td className="px-6 py-4 text-sm"> */}
                         <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans capitalize">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="">
                                {review.testerName}
                              </div>
                              {review.productName && (
                                <div className="text-xs text-slate-400">
                                  {review.productName}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                       <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          <div className="flex items-center gap-2">
                            {renderStars(review.rate)}
                            <span className="text-sm font-medium text-slate-300">
                              {review.rate}
                            </span>
                          </div>
                        </td>
                       <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          <p className="truncate">{review.review}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                       <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans flex gap-2 items-center">
                          {/* <div className="flex items-center gap-2"> */}
                              <Calendar className="w-3 h-3 text-gray-4" />
                            {formatDate(review.createdAt)}
                          {/* </div> */}
                        </td>
                       <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          <DropdownMenu.Root
                            open={openDropdown === review.id}
                            onOpenChange={(open) =>
                              setOpenDropdown(open ? review.id : null)
                            }
                          >
                            <DropdownMenu.Trigger asChild>
                             <button className="p-2 hover:bg-gray-5/10">
                                                             <MoreHorizontal className="w-4 h-4 text-gray-4" />
                                                           </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content
                                className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-1 z-50 min-w-[160px]"
                                align="end"
                              >
                                {review.status === "pending" && (
                                  <>
                                    <DropdownMenu.Item
                                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-green-500/10 text-green-400 rounded cursor-pointer outline-none"
                                      onClick={() => {
                                        handleQuickAction(review, "approved");
                                        setOpenDropdown(null);
                                      }}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Approve
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-500/10 text-red-400 rounded cursor-pointer outline-none"
                                      onClick={() => {
                                        handleQuickAction(review, "rejected");
                                        setOpenDropdown(null);
                                      }}
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Reject
                                    </DropdownMenu.Item>
                                  </>
                                )}
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 text-slate-300 rounded cursor-pointer outline-none"
                                  onClick={() => {
                                    setSelectedReview(review);
                                    setShowDetailModal(true);
                                    setOpenDropdown(null);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredReviews.length > 0 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            totalItems={filteredReviews.length}
            itemsPerPage={ITEMS_PER_PAGE}
            hasPrev={currentPage > 1}
            hasNext={currentPage < totalPages}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>
      <DeleteConfirmationDialog
        deleteBrandId={deleteConfirmId ? 1 : null}
        setDeleteBrandId={(v) => setDeleteConfirmId(v ? deleteConfirmId : null)}
        confirmDelete={handleConfirmAction}
        deleteLoading={isDeleting}
        heading={
          deleteAction?.action === "approved"
            ? "Approve Review?"
            : "Reject Review?"
        }
        content={
          deleteAction?.action === "approved"
            ? "Are you sure you want to approve this review? It will be visible on the product page."
            : "Are you sure you want to reject this review? This action cannot be undone."
        }
        actionLabel={deleteAction?.action === "approved" ? "Approve" : "Rejected"}
        mode="dark"
      />

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <DialogPopup
          heading="Review Details"
          open={showDetailModal}
          setShowCreateModal={setShowDetailModal}
          mode="dark"
          overlayStyle="bg-black/70"
          className="bg-slate-800 border border-slate-700"
        >
          <div className="space-y-6">
            {/* Tester Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Tester Information
              </h3>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg space-y-2">
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Name:</span>
                  <span className="ml-2 text-slate-400">
                    {selectedReview.testerName}
                  </span>
                </p>
                {selectedReview.productName && (
                  <p className="text-sm text-slate-300">
                    <span className="font-medium">Product:</span>
                    <span className="ml-2 text-slate-400">
                      {selectedReview.productName}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Rating
              </h3>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  {renderStars(selectedReview.rate)}
                  <span className="text-lg font-bold text-slate-100">
                    {selectedReview.rate} / 5
                  </span>
                </div>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Review
              </h3>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <p className="text-slate-300 leading-relaxed">
                  {selectedReview.review}
                </p>
              </div>
            </div>

            {/* Images */}
            {selectedReview.images && selectedReview.images.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Review Images
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {selectedReview.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.src}
                      alt={img.alt || `Review image ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-slate-700"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Status & Meta */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Review Status
              </h3>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg space-y-2">
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Status:</span>
                  <span className="ml-2">
                    {
                      statusConfig[
                        selectedReview.status as keyof typeof statusConfig
                      ].label
                    }
                  </span>
                </p>
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Submitted:</span>
                  <span className="ml-2 text-slate-400">
                    {formatDate(selectedReview.createdAt)}
                  </span>
                </p>
                <p className="text-sm text-slate-300 flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="font-medium">Helpful Count:</span>
                  <span>{selectedReview.helpfulCount || 0}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedReview.status === "pending" && (
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => {
                    handleQuickAction(selectedReview, "approve");
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Review
                </button>
                <button
                  onClick={() => {
                    handleQuickAction(selectedReview, "reject");
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Review
                </button>
              </div>
            )}
          </div>
        </DialogPopup>
      )}
    </div>
  );
};

export default AdminReviews;