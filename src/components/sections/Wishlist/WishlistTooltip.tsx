"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import IconWishlist from "@/assets/icon/IconWishlist";
import CardLayout from "@/components/ui/CardLayout";
import toast from "react-hot-toast";
import {
  fetchWishlistWithProducts,
  addToWishlist,
} from "@/libs/redux/slices/wishlistSlice";
import { RootState, AppDispatch } from "@/libs/redux/store";
import Spinner from "@/components/ui/Loader";
import Anchor from "@/components/ui/Anchor";

interface WishlistTooltipProps {
  mode?: "popup" | "inline";
  profileUserId?: string; // ID of the profile being viewed
}

const WishlistTooltip: React.FC<WishlistTooltipProps> = ({ 
  mode = "popup",
  profileUserId 
}) => {
  const [open, setOpen] = useState(mode === "inline");
  const [isClient, setIsClient] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const { items: wishlist, loading, error } = useSelector(
    (state: RootState) => state.wishlist
  );

  const currentUserId = session?.user?.id;
  const currentUserRole = session?.user?.role;
  const isAdmin = currentUserRole === "admin";

  // Determine whose wishlist to display
  // If admin is viewing another user's profile, show that user's wishlist
  // Otherwise, show the current user's wishlist
  const targetUserId = isAdmin && profileUserId && profileUserId !== currentUserId
    ? profileUserId
    : currentUserId;

  const isViewingOtherUser = isAdmin && profileUserId && profileUserId !== currentUserId;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch wishlist on mount or when target user changes
  useEffect(() => {
    if (targetUserId) {
      dispatch(fetchWishlistWithProducts(targetUserId));
    }
  }, [dispatch, targetUserId]);

  const handleRemoveFromWishlist = async (
    productId?: string,
    brandId?: string,
    entityType: "product" | "brand" = "product"
  ) => {
    // Only allow removing from own wishlist, not when viewing others
    if (!currentUserId || isViewingOtherUser) {
      toast.error("You cannot modify another user's wishlist");
      return;
    }

    try {
      await dispatch(
        addToWishlist({ userId: currentUserId, productId, brandId, entityType })
      ).unwrap();
      toast.success("Product removed from wishlist");
      dispatch(fetchWishlistWithProducts(currentUserId));
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      toast.error("Failed to remove product. Please try again.");
    }
  };

  useEffect(() => {
    if (mode === "inline") return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [mode]);

  const WishlistContent = () => {
    if (loading) {
      return (
        <div className="text-center mt-10 flex justify-center items-center">
          <Spinner className="w-16 h-16" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center mt-10">
          <p className="text-red-500 mb-6">{error}</p>
        </div>
      );
    }
    if (!targetUserId) {
      return (
        <div className="text-center mt-10">
          <p className="text-red-600 mb-6">Login to see your wishlisted products.</p>
          <div className="flex justify-center">
            <Anchor href="/accounts/sign-in">Login</Anchor>
          </div>
        </div>
      );
    }
    if (wishlist.length === 0) {
      return (
        <div className="text-center mt-10">
          <p className="text-gray-500 mb-6">
            {isViewingOtherUser 
              ? "This user has no items in their wishlist." 
              : "No item in your wishlist."}
          </p>
          {mode === "popup" && (
            <div className="flex justify-center">
              <button
                onClick={() => setOpen(false)}
                className="py-[14.5px] px-[30px] bg-[#0060FF] text-white hover:opacity-90 transition-all"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      );
    }
console.log(wishlist,"wishlist")
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {wishlist.map((item) => {
          const productHandle =
            item.product?.handle ||
            item.product?.name
              ?.trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "") ||
            item.productId;

          return (
            <div
              key={
                item.id ||
                `${item.productId}-${item.entityType}-${item.brandId || "noBrand"}`
              }
              className="relative group"
            >
              <CardLayout
                title={item.product?.name || "Product"}
                category={item.product?.category}
                price={item.product?.price || "N/A"}
                image1={item.product?.media?.[0]}
                image2={item.product?.media?.[1]}
                href={`/products/${productHandle}`}
                WishListIcon={
                  !isViewingOtherUser ? (
                    <button
                      onClick={() =>
                        handleRemoveFromWishlist(
                          item.productId,
                          item.brandId,
                          item.entityType
                        )
                      }
                      disabled={loading}
                      className="p-1 hover:bg-white/20 rounded disabled:opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="red"
                        stroke="red"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6"
                      >
                        <path d="M19.67 5.47C17.68 3.83 14.72 4.12 12.89 5.95L12 6.84 11.11 5.95C9.29 4.13 6.32 3.83 4.33 5.47 2.05 7.35 1.93 10.74 3.97 12.78L12 21l8.03-8.22c2.04-2.04 1.92-5.44-.36-7.31z" />
                      </svg>
                    </button>
                  ) : (
                    <div className="p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="red"
                        stroke="red"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6"
                      >
                        <path d="M19.67 5.47C17.68 3.83 14.72 4.12 12.89 5.95L12 6.84 11.11 5.95C9.29 4.13 6.32 3.83 4.33 5.47 2.05 7.35 1.93 10.74 3.97 12.78L12 21l8.03-8.22c2.04-2.04 1.92-5.44-.36-7.31z" />
                      </svg>
                    </div>
                  )
                }
              />
            </div>
          );
        })}
      </div>
    );
  };

  if (mode === "inline") {
    return (
      <div className="w-full">
        {WishlistContent()}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Trigger Button - Only show for current user's wishlist */}
      {!profileUserId && (
        <button
          onClick={() => setOpen(true)}
          className="relative p-2 rounded-full border border-[#151515] transition"
        >
          <IconWishlist className="w-[20px] h-[20px]" />
          {isClient && wishlist.length > 0 && !isViewingOtherUser && (
            <span className="absolute -top-2 -right-1 bg-[#FFD400] text-black text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
              {wishlist.length}
            </span>
          )}
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white w-[92%] md:w-[1000px] h-[94vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {isViewingOtherUser 
                  ? "User's Wishlist 👀" 
                  : "Products You Liked ❤️"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-white text-2xl font-bold hover:opacity-80"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
              {WishlistContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default WishlistTooltip;