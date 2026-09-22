import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface WishlistItem {
  id?: string;
  userId: string;
  productId?: string;
  brandId?: string;
  entityType: "product" | "brand";
  createdAt?: string;
  updatedAt?: string;
  product?: {
    id: string;
    name: string;
    handle: string;
    price: string;
    media: string[];
    category?: string;
  };
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (
    payload: {
      userId: string;
      productId?: string;
      brandId?: string;
      entityType: "product" | "brand";
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || `HTTP ${response.status}`);
      }

      return { ...payload, action: data.action };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Network error"
      );
    }
  }
);

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/wishlist?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || `HTTP ${response.status}`);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Network error"
      );
    }
  }
);
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async ({
    userId,
    productId,
    entityType,
  }: {
    userId: string;
    productId: string;
    entityType: "product" | "brand";
  }) => {
    const res = await fetch(`/api/wishlist`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId, entityType }),
    });
    if (!res.ok) throw new Error("Failed to remove from wishlist");
    return await res.json();
  }
);

export const fetchWishlistWithProducts = createAsyncThunk(
  "wishlist/fetchWishlistWithProducts",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/wishlist?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || `HTTP ${response.status}`);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Network error"
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchWishlist.fulfilled,
        (state, action: PayloadAction<WishlistItem[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch wishlist";
      })
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const {
          productId,
          brandId,
          entityType,
          action: apiAction,
        } = action.payload;

        if (apiAction === "removed") {
          state.items = state.items.filter((item) => {
            if (entityType === "product") return item.productId !== productId;
            if (entityType === "brand") return item.brandId !== brandId;
            return true;
          });
        } else if (apiAction === "added") {
          state.items.push({
            userId: action.payload.userId,
            productId,
            brandId,
            entityType,
          });
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update wishlist";
      })
      .addCase(fetchWishlistWithProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchWishlistWithProducts.fulfilled,
        (state, action: PayloadAction<WishlistItem[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchWishlistWithProducts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Failed to fetch wishlist with products";
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, entityType } = action.meta.arg;
        state.items = state.items.filter((item) => {
          if (entityType === "product") return item.productId !== productId;
          if (entityType === "brand") return item.brandId !== productId;
          return true;
        });
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to remove from wishlist";
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
