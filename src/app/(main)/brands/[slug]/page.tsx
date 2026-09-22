import CollectionBanner from "@/components/sections/Collections/BrandCollection";


interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params; 
  console.log(slug, "slug");
  return <CollectionBanner brandHandle={slug} />;
}