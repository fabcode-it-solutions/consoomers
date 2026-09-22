import BrandDetail from "@/components/dashboard/brands/BrandDetailPage";

interface BrandPageProps {
  params: { brandId: string };
}

export default async function BrandPage({ params }: BrandPageProps) {

  const { brandId } = await params; 

  return <BrandDetail brandId={brandId} />;
}
