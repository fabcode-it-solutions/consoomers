/* eslint-disable @typescript-eslint/no-explicit-any */
// store/profileSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
type TesterProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country?: string;
  state?: string;
  locationType?: string;
  householdComposition?: string;
  householdIncome?: string;
  gender?: string;
  ageGroup?: string;
  categoryInterested?: string[];
  mainInterest?: string[];
  specificIntrest?: string[];
  beautySkinType?: string;
  beautySkinTone?: string;
  hairColor?: string;
  hairType?: string;
  avgMonthlySpend?: string;
  fitnessWellness?: string[];
  primaryFocus?: string[];
  foodBeverage?: string[];
  foodAllergies?: string;
  hobbies?: string[];
  pets?: string[];
  kids?: string[];
  avatarUrl?: string;
  aboutYou?: string;
  agreement?: string[];
  testerTier?: string;
  criteria?: string[];
  score?: string;
  profileImage?: any[];
  generalAgreement?: boolean;  // <-- added
  imageUrl?: string;           // <-- added
  createdAt?: Date;
  updatedAt?: Date;
  url ?: string
};

interface ProfileState {
  profile: TesterProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

// Optional: async thunk to fetch a profile by ID
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (id: number) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/user?id=${id}`
    );
    if (!res.ok) throw new Error("Failed to fetch profile");
    return (await res.json()) as TesterProfile;
  }
);

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<TesterProfile>) {
      state.profile = action.payload;
    },
    updateProfile(state, action: PayloadAction<Partial<TesterProfile>>) {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearProfile(state) {
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch profile";
      });
  },
});

export const { setProfile, updateProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
