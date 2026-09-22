/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";

const MainWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    if (
      !user &&
      session &&
      (session?.user?.email != "undefined" || !session?.user?.email)
    ) {
      // (async () => {
      //   const response = (await request({
      //     url: "/api/user?email=" + session.user.email,
      //     enableToast: false,
      //   })) as UserResponse;
      //   if (response && response?.user) {
      //     const user = response?.user;
      //     if (user.id) {
      //       localStorage.setItem("userIdOverlap", String(user.id));
      //       dispatch(setUser(user));
      //     }
      //   }
      // })();
    }
  }, [session]);
  return <div>{children}</div>;
};

export default MainWrapper;
