"use client";
import React, { Suspense } from "react";
import Search from "@/components/sections/Search/Search";
import Spinner from "@/components/ui/Loader";

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Spinner className="w-20 h-20" />
        </div>
      }
    >
      <Search />
    </Suspense>
  );
};

export default Page;
