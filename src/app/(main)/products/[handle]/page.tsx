import ProductDetail from "@/components/sections/ProductDetail/ProductDetail";

interface Props {
  params: Promise<{ handle: string }>;
}

const ProductPage = async ({ params }: Props) => {
  const { handle } = await params;
  return <ProductDetail handle={handle} />;
};

export default ProductPage;
