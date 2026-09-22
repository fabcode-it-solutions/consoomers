import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import wishlistReducer from "./slices/wishlistSlice";
import quickVoteReducer from "./slices/quickVoteSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      profile: profileReducer,
      wishlist: wishlistReducer,
      quickVote: quickVoteReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
