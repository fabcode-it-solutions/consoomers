"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Star,
  X,
  Check,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { MediaItem } from "@/types/media.types";
import { MediaInput } from "@/components/global/media/upload/MediaInput";
import DeleteConfirmationDialog from "@/components/ui/dashboard/ConfirmationPopup";
import toast from "react-hot-toast";

interface ProductReviewsProps {
  productId: string;
  session: any;
}

interface RatingBreakdown {
  excellent: number;
  veryGood: number;
  good: number;
  average: number;
  poor: number;
}

interface LightboxState {
  isOpen: boolean;
  images: any[];
  currentIndex: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  session,
}) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);

  // Eligibility state
  const [eligible, setEligible] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  // User review (could be pending / approved / rejected)
  const [userReview, setUserReview] = useState<any | null>(null);

  // Delete confirmation state
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Lightbox state
  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/review?productId=${productId}`);
      const data = await res.json();
      console.log("Reviews fetch response data:", data);
      if (res.ok) {
        // Only show approved reviews in the public list
        const approvedReviews = (data.reviews || []).filter(
          (review: any) => review.status === "approved"
        );
        setReviews(approvedReviews);

        // Find any review by current user (pending or approved)
        if (session?.user?.id) {
          const allReviews = data.reviews || [];
          const existingUserReview = allReviews.find(
            (r: any) => r.testerId === session.user.id
          );
          setUserReview(existingUserReview || null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check eligibility
  const checkEligibility = async () => {
    if (!session?.user?.id || session?.user?.role !== "tester") {
      setEligible(false);
      setCheckingEligibility(false);
      return;
    }
    try {
      setCheckingEligibility(true);
      const res = await fetch(
        `/api/review/eligibility?productId=${productId}&testerId=${session.user.id}`
      );
      const data = await res.json();
      setEligible(Boolean(data.eligible));
    } catch (err) {
      console.error("Eligibility check failed:", err);
      setEligible(false);
    } finally {
      setCheckingEligibility(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    checkEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, session?.user?.id]);

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!lightbox.isOpen) return;
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [lightbox]);

  const handleMediaChange = (media: MediaItem[]) => {
    setSelectedMedia(media);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (rating === 0) return setError("Please select a rating");
    if (!reviewText.trim()) return setError("Please write a review");
    if (!session?.user?.id)
      return setError("You must be logged in to submit a review");

    setSubmitting(true);
    try {
      const imageIds = selectedMedia.map((m) => m.id);
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          testerId: session.user.id,
          rate: rating.toString(),
          review: reviewText,
          images: imageIds,
          status: "pending",
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(
          "Thank you for your review! It will appear after admin approval."
        );
        setRating(0);
        setReviewText("");
        setSelectedMedia([]);
        setShowForm(false);
        toast.success(
          data.message ||
            "Thank you for your review! It will appear after admin approval."
        );
        setUserReview({ testerId: session.user.id, status: "pending" });
        fetchReviews();
      } else {
        setError(data.error || "Failed to submit review");
      }
    } catch (err) {
      console.error("Submit review error:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete review
  const confirmDeleteReview = async () => {
    if (!session?.user?.id || !deleteReviewId) return;
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/review/${deleteReviewId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testerId: session.user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Review deleted successfully.");
        toast.success("Review deleted successfully.");
        setUserReview(null);
        fetchReviews();
      } else {
        setError(data.error || "Failed to delete review");
        toast.error(data.error || "Failed to delete review");
      }
    } catch (err) {
      console.error("Delete review error:", err);
      setError("Failed to delete review. Please try again.");
    } finally {
      setDeleteLoading(false);
      setDeleteReviewId(null);
    }
  };

  // Lightbox helpers
  const openLightbox = (images: any[], index: number) => {
    setLightbox({ isOpen: true, images, currentIndex: index });
  };
  const closeLightbox = () => setLightbox({ ...lightbox, isOpen: false });
  const handlePrevImage = () =>
    setLightbox({
      ...lightbox,
      currentIndex:
        (lightbox.currentIndex - 1 + lightbox.images.length) %
        lightbox.images.length,
    });
  const handleNextImage = () =>
    setLightbox({
      ...lightbox,
      currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length,
    });

  const renderStars = (count: number, interactive = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={
            interactive
              ? "cursor-pointer transition-transform hover:scale-110"
              : ""
          }
        >
          <Star
            className={`w-5 h-5 ${
              star <= (interactive ? hoverRating || rating : count)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  const getStatusBadge = (status?: string) => {
    if (!status || typeof status !== "string") status = "approved";
    const statusConfig: Record<
      string,
      { bg: string; text: string; icon: React.ComponentType<any> }
    > = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
      approved: { bg: "bg-green-100", text: "text-green-800", icon: Check },
      rejected: { bg: "bg-red-100", text: "text-red-800", icon: X },
    };
    const config = statusConfig[status.toLowerCase()] || statusConfig.approved;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const getRatingBreakdown = (): RatingBreakdown => {
    const breakdown: RatingBreakdown = {
      excellent: 0,
      veryGood: 0,
      good: 0,
      average: 0,
      poor: 0,
    };
    reviews.forEach((review) => {
      const rate = parseFloat(review.rate);
      if (rate === 5) breakdown.excellent++;
      else if (rate === 4) breakdown.veryGood++;
      else if (rate === 3) breakdown.good++;
      else if (rate === 2) breakdown.average++;
      else if (rate === 1) breakdown.poor++;
    });
    return breakdown;
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r: any) => sum + parseFloat(r.rate), 0) /
          reviews.length
        ).toFixed(1)
      : "0";
  const totalRatings = reviews.length;
  const breakdown = getRatingBreakdown();

  // Option A: show container only if there are approved reviews or the user opened the form
  const shouldShowContainer = reviews.length > 0 || showForm;

  // If there are no approved reviews and the form is closed => show small UI with button (no bordered box)
  if (!shouldShowContainer) {
    // Show button only for testers (you can adjust who sees it)
    if (session?.user?.role === "tester") {
      return (
        <div className="w-full max-w-6xl mx-auto px-4 py-4">
          <div className="text-left">
            {checkingEligibility ? (
              <p className="text-sm text-gray-500">Checking eligibility...</p>
            ) : eligible && !userReview ? (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 transition-colors"
              >
                Write a Review
              </button>
            ) : null}
          </div>
        </div>
      );
    }

    // Not a tester or otherwise not allowed => show nothing
    return null;
  }

  // MAIN container (shown when reviews exist or form is open)
  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 py-8 border border-gray-200 bg-white">
        {/* Header - Show Write Review Button OR Completed Badge */}
        {session?.user?.role === "tester" && !showForm && (
          <div className="flex items-center justify-between mb-4 px-6">
            <h2 className="font-semibold text-[26px]">Product Reviews </h2>
            {checkingEligibility ? (
              <p className="text-sm text-gray-500">Checking eligibility...</p>
            ) : eligible && !userReview ? (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium rounded"
              >
                Write a Review
              </button>
            ) : null}
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="mb-8 p-6 border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Write Your Review</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setError("");
                  setRating(0);
                  setReviewText("");
                  setSelectedMedia([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating *
                </label>
                {renderStars(rating, true)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your thoughts about this product..."
                  required
                />
              </div>

              <div>
                <MediaInput
                  label="Add Photos (Optional)"
                  mode="multiple"
                  selectedMedia={selectedMedia}
                  onChange={handleMediaChange}
                  userId={session?.user?.id || ""}
                  config={{ maxFiles: 5 }}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 5 images</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>

              {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">
                  {success}
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rating Summary & Reviews List */}
        {reviews.length > 0 && (
          <>
            <div className="bg-white px-6 py-1">
              <div className="lg:grid lg:grid-cols-[180px_1fr] lg:gap-10">
                <div className="flex flex-col items-center text-center">
                  <div className="text-green-600 flex items-center text-[52px] font-bold leading-none">
                    {averageRating}
                    <Star className="w-10 h-10 ml-1 fill-green-500 text-green-500" />
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">
                    <span className="font-semibold">
                      {totalRatings} Ratings,
                    </span>
                    <br />
                    {reviews.filter((r) => r.review).length} Reviews
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  {[
                    {
                      label: "Excellent",
                      count: breakdown.excellent,
                      color: "bg-green-500",
                    },
                    {
                      label: "Very Good",
                      count: breakdown.veryGood,
                      color: "bg-green-400",
                    },
                    {
                      label: "Good",
                      count: breakdown.good,
                      color: "bg-yellow-500",
                    },
                    {
                      label: "Average",
                      count: breakdown.average,
                      color: "bg-orange-500",
                    },
                    {
                      label: "Poor",
                      count: breakdown.poor,
                      color: "bg-red-500",
                    },
                  ].map((item) => {
                    const percentage =
                      totalRatings > 0 ? (item.count / totalRatings) * 100 : 0;
                    return (
                      <div key={item.label} className="flex items-center gap-4">
                        <span className="text-sm text-gray-700 w-24">
                          {item.label}
                        </span>
                        <div className="flex-1 h-2 bg-gray-200 overflow-hidden">
                          <div
                            className={`h-full ${item.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-700 w-10 text-right">
                          {item.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                </div>
              ) : (
                reviews.map((review: any) => (
                  <div key={review.id} className="border-t-[1px] pt-7">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.testerName || "Anonymous User"}
                          </h4>

                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded">
                              <span className="font-semibold">
                                {review.rate}
                              </span>
                              <Star className="w-3 h-3 fill-white" />
                            </div>
                            <span className="text-sm text-gray-500">
                              Posted on{" "}
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {review.testerId === session?.user?.id && (
                          <button
                            onClick={() => setDeleteReviewId(review.id)}
                            className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50 text-sm"
                          >
                            Delete Review
                          </button>
                        )}
                        {getStatusBadge(review.status)}
                      </div>
                    </div>

                    <p className="text-gray-800 mb-4 leading-relaxed">
                      {review.review}
                    </p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-7">
                        {review.images.map((img: any, idx: number) => {
                          const isVideo =
                            img.type === "video" ||
                            /\.(mp4|webm|ogg)$/i.test(img.src);
                          return (
                            <button
                              key={idx}
                              onClick={() => openLightbox(review.images, idx)}
                              className="relative group overflow-hidden border border-gray-200 hover:shadow-lg transition-all"
                            >
                              {isVideo ? (
                                <video
                                  src={img.src}
                                  className="w-16 h-16 object-cover hover:scale-110 transition-transform duration-200"
                                  muted
                                  autoPlay
                                  loop
                                  onError={(e) =>
                                    ((
                                      e.target as HTMLVideoElement
                                    ).style.display = "none")
                                  }
                                />
                              ) : (
                                <img
                                  src={img.src}
                                  alt={img.alt || `Review image ${idx + 1}`}
                                  className="w-16 h-16 object-cover hover:scale-110 transition-transform duration-200"
                                  onError={(e) =>
                                    ((
                                      e.target as HTMLImageElement
                                    ).style.display = "none")
                                  }
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}

              <DeleteConfirmationDialog
                deleteBrandId={deleteReviewId ? parseInt(deleteReviewId) : null}
                setDeleteBrandId={(v) =>
                  setDeleteReviewId(v ? v.toString() : null)
                }
                confirmDelete={confirmDeleteReview}
                deleteLoading={deleteLoading}
                heading="Confirm Delete"
                content="Are you sure you want to delete your review? This action cannot be undone."
                actionLabel="Delete"
                mode="light"
              />
            </div>
          </>
        )}
      </div>
      {lightbox.isOpen && lightbox.images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="relative w-full h-full max-w-4xl flex items-center justify-center px-4">
              {(() => {
                const currentMedia = lightbox.images[lightbox.currentIndex];
                const isVideo =
                  currentMedia.type === "video" ||
                  /\.(mp4|webm|ogg)$/i.test(currentMedia.src);
                return isVideo ? (
                  <video
                    src={currentMedia.src}
                    controls
                    className="max-h-full max-w-full object-contain"
                    autoPlay
                    muted
                  />
                ) : (
                  <img
                    src={currentMedia.src}
                    alt="Zoomed review"
                    className="max-h-full max-w-full object-contain"
                  />
                );
              })()}
            </div>

            {lightbox.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
              {lightbox.currentIndex + 1} / {lightbox.images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductReviews;
