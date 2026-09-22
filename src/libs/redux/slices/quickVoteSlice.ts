// store/slices/quickVoteSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

type Option = { value: string; label: string };
type ProductVoteState = {
  options: Option[];
  loading: boolean;
  error?: string | null;
  submitting: boolean;
  stats: Record<string, number>;
  hasVoted: boolean;
};

type VoteState = {
  products: Record<string, ProductVoteState>;
};

const initialProductState: ProductVoteState = {
  options: [],
  loading: false,
  error: null,
  submitting: false,
  stats: {},
  hasVoted: false,
};

const initialState: VoteState = {
  products: {},
};

// ✅ 1. Include `userId` in fetchOptions to check if already voted


export const fetchOptions = createAsyncThunk<
  { options: Option[]; stats?: Record<string, number>; productId: string; hasVoted?: boolean },
  { productId: string; includeStats?: boolean; userId?: string }
>(
  "quickVote/fetchOptions",
  async ({ productId, includeStats = false, userId }, { rejectWithValue }) => {
    try {
      const url = `/api/quickvotes?productId=${productId}${
        includeStats ? "&includeStats=true" : ""
      }${userId ? `&userId=${userId}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load options");
      const data = await res.json();
      return { ...data, productId };
    } catch (err: unknown) {
      console.error("fetchOptions error:", err);
      return rejectWithValue(
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  }
);

export const submitVote = createAsyncThunk<
  { stats: Record<string, number>; productId: string },
  { productId: string; selected: string[]; userId?: string }
>(
  "quickVote/submitVote",
  async ({ productId, selected, userId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/quickvotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, selected, userId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to submit vote");
      }
      const data = await res.json();
      return { stats: data.stats || {}, productId };
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  }
);

export const fetchStats = createAsyncThunk<
  { stats: Record<string, number>; productId: string },
  { productId: string }
>(
  "quickVote/fetchStats",
  async ({ productId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/quickvotes/stats?productId=${productId}`);
      if (!res.ok) throw new Error("Failed to load stats");
      const data = await res.json();
      return { stats: data.stats, productId };
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  }
);

const slice = createSlice({
  name: "quickVote",
  initialState,
  reducers: {
    resetProductState: (state, action: PayloadAction<string>) => {
      delete state.products[action.payload];
    },
    clearError: (state, action: PayloadAction<string>) => {
      if (state.products[action.payload]) {
        state.products[action.payload].error = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- FETCH OPTIONS ----
      .addCase(fetchOptions.pending, (state, action) => {
        const productId = action.meta.arg.productId;
        if (!state.products[productId]) {
          state.products[productId] = { ...initialProductState };
        }
        state.products[productId].loading = true;
        state.products[productId].error = null;
      })
      .addCase(fetchOptions.fulfilled, (state, action) => {
        const { productId, options, stats, hasVoted } = action.payload;
        const product = state.products[productId] || { ...initialProductState };

        product.loading = false;
        product.options = options;
        if (stats) product.stats = stats;
        product.hasVoted = !!hasVoted;

        state.products[productId] = product;
      })
      .addCase(fetchOptions.rejected, (state, action) => {
        const productId = action.meta.arg.productId;
        if (state.products[productId]) {
          state.products[productId].loading = false;
          state.products[productId].error = action.payload as string;
        }
      })

      // ---- SUBMIT VOTE ----
      .addCase(submitVote.pending, (state, action) => {
        const productId = action.meta.arg.productId;
        if (state.products[productId]) {
          state.products[productId].submitting = true;
          state.products[productId].error = null;
        }
      })
      .addCase(submitVote.fulfilled, (state, action) => {
        const { productId, stats } = action.payload;
        if (state.products[productId]) {
          state.products[productId].submitting = false;
          state.products[productId].stats = stats;
          state.products[productId].hasVoted = true;
        }
      })
      .addCase(submitVote.rejected, (state, action) => {
        const productId = action.meta.arg.productId;
        if (state.products[productId]) {
          state.products[productId].submitting = false;
          state.products[productId].error = action.payload as string;
        }
      })

      // ---- FETCH STATS ----
      .addCase(fetchStats.fulfilled, (state, action) => {
        const { productId, stats } = action.payload;
        if (state.products[productId]) {
          state.products[productId].stats = stats;
        }
      })
      .addCase(fetchStats.rejected, (state, action) => {
        const productId = action.meta.arg.productId;
        if (state.products[productId]) {
          state.products[productId].error = action.payload as string;
        }
      });
  },
});

export const { resetProductState, clearError } = slice.actions;
export default slice.reducer;

// ✅ Selector
export const selectProductVoteState = (state: RootState, productId: string) =>
  state.quickVote.products[productId] || initialProductState;
