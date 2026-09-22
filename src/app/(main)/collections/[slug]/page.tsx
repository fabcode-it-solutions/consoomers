import { getServerSession } from "next-auth";


import CollectionBanner from "@/components/sections/Collections/BrandCollection";
import WithoutSignUpBrandPage from "@/components/sections/Collections/WithoutSignUpBrandPage";
import { authOptions } from "@/libs/auth/auth";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return <WithoutSignUpBrandPage />;
  }
  return <CollectionBanner brandHandle={slug} />;
}
