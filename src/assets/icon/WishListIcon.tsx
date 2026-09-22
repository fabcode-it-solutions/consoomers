import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
} from "@/libs/redux/slices/wishlistSlice";
import { RootState, AppDispatch } from "@/libs/redux/store";

interface WishListIconProps {
  size?: number;
  productId?: string;
  entityType?: "product" | "brand";
}

const WishListIcon: React.FC<WishListIconProps> = ({
  size = 24,
  productId,
  entityType = "product",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const { items, loading } = useSelector((state: RootState) => state.wishlist);

  const userId = session?.user?.id;

  const isInWishlist = items.some(
    (item) => item.productId === productId && item.entityType === entityType
  );

  useEffect(() => {
    if (userId) dispatch(fetchWishlist(userId));
  }, [dispatch, userId]);



  const handleToggleWishlist = async () => {
    if (!userId || !productId) {
      toast.error("You need to be logged in to use wishlist 💡");
      return;
    }



    try {
      if (isInWishlist) {
        // remove
        await dispatch(
          removeFromWishlist({
            userId,
            productId,
            entityType,
          })
        ).unwrap();

        toast.success("Product Removed from wishlist"); 
      } else {
        // add
        await dispatch(
          addToWishlist({
            userId,
            productId,
            entityType,
          })
        ).unwrap();

        toast.success("Product added to wishlist");
      }
    } catch (err) {
      console.error("❌ Wishlist API error:", err);
      toast.error("Something went wrong. Try again.");
    }
  };


  return (
    <button
      onClick={handleToggleWishlist}
      disabled={loading || !userId}
      className="p-1 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isInWishlist ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
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
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-gray-700 hover:text-red-500"
        >
          <path d="M19.67 5.47C17.68 3.83 14.72 4.12 12.89 5.95L12 6.84 11.11 5.95C9.29 4.13 6.32 3.83 4.33 5.47 2.05 7.35 1.93 10.74 3.97 12.78L12 21l8.03-8.22c2.04-2.04 1.92-5.44-.36-7.31z" />
        </svg>
      )}
    </button>
  );
};

export default WishListIcon;
