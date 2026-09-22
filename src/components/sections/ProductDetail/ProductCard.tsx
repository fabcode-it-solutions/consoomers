import React from "react";
import CardLayout from "@/components/ui/CardLayout";

interface ProductCardProps {
  handle: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  media: string[];
  price: string;
  showWishlist?: boolean;
  productId?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  handle,
  name,
  category,
  media,
  price,
}) => {
 
  return (
    <CardLayout
      title={name}
      category={category}
      image1={media?.[0]}
      image2={media?.[1]}
      price={price}
      href={`/products/${handle}`}
      //  WishListIcon={<WishListIcon productId={productId} entityType="product" />}
    />
  );
};

export default ProductCard;
