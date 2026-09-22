// app/not-found.tsx

import NotFoundContent from "@/components/sections/NotFoundContent";
import React from "react";

const NotFound: React.FC = () => {
  return (
    <>
      <main className="flex-grow flex justify-center items-center min-h-screen">
        <NotFoundContent />
      </main>
    </>
  );
};

export default NotFound;
