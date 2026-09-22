import { User } from "@/db/type";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserState = {
  id?: number;
  user: User | null;
  isPrivate?: boolean;
  isBlocked?: boolean;
  loading?: boolean;
  error?: null | string;
  
};

const initialState: UserState = {
  user: null,
  isPrivate: false,
  isBlocked: false,
  loading: false,
  error: null,
};
export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (id: number) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/user?id=${id}`
    );
    if (!res.ok) throw new Error("Failed to fetch user");
    return (await res.json()) as User;
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setPrivate(state, action: PayloadAction<boolean>) {
      state.isPrivate = action.payload;
    },
    setBlocked(state, action: PayloadAction<boolean>) {
      state.isBlocked = action.payload;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearUser(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch";
      });
  },
});

export const { setUser, updateUser, clearUser, setPrivate, setBlocked } =
  userSlice.actions;
export default userSlice.reducer;
