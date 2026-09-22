import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { AppDispatch, RootState } from "@/libs/redux/store";
import { addToWishlist, fetchWishlist } from "@/libs/redux/slices/wishlistSlice";

export const useWishlist = (userId?: string, currentUserId?: string, currentUserRole?: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((state: RootState) => state.wishlist);

  // Determine which user's wishlist to fetch
  // If admin is viewing another user's profile, show that user's wishlist
  // Otherwise, show the current user's wishlist
  const targetUserId = 
    currentUserRole === "admin" && userId && userId !== currentUserId
      ? userId  // Admin viewing another user's profile
      : currentUserId;  // Current user's own wishlist

  useEffect(() => {
    if (targetUserId && items.length === 0) {
      dispatch(fetchWishlist(targetUserId));
    }
  }, [targetUserId, dispatch, items.length]);

  const toggleWishlist = async (params: {
    userId: string;
    productId?: string;
    brandId?: string;
    entityType: "product" | "brand";
  }) => {
    try {
      await dispatch(addToWishlist(params)).unwrap();
      return true;
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      return false;
    }
  };

  const isInWishlist = (productId?: string, brandId?: string, entityType?: "product" | "brand") => {
    if (!entityType) return false;
    
    return items.some(item => {
      if (entityType === "product" && productId) {
        return item.productId === productId && item.entityType === "product";
      }
      if (entityType === "brand" && brandId) {
        return item.brandId === brandId && item.entityType === "brand";
      }
      return false;
    });
  };

  const refreshWishlist = () => {
    if (targetUserId) {
      dispatch(fetchWishlist(targetUserId));
    }
  };

  return {
    items,
    loading,
    error,
    toggleWishlist,
    isInWishlist,
    refreshWishlist,
    isViewingOtherUser: currentUserRole === "admin" && userId && userId !== currentUserId
  };
};