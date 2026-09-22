import CategoryPage from "@/components/sections/categorypage/CategoryPage";
import WithoutSignUpBrandPage from "@/components/sections/Collections/WithoutSignUpBrandPage";
import { authOptions } from "@/libs/auth/auth";

import { getServerSession } from "next-auth";

import React from "react";

interface PageProps {
  params: { category: string };
}

export default async function CategoryPageRoute({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  // ❌ No login → show alternate page
  if (!session?.user) {
    return <WithoutSignUpBrandPage />;
  }

 

  // Logged-in brand → Show page
  return (
    <div>
      <CategoryPage  />
    </div>
  );
}
