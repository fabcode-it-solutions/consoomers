"use client";

import React, { useEffect, useState } from "react";
import Heading from "@/components/ui/Heading";
import CardLayout from "@/components/ui/CardLayout";
import WishListIcon from "@/assets/icon/WishListIcon";
import Spinner from "@/components/ui/Loader";

interface Product {
  id: string;
  handle: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  media: string[];
  price: string;
  brandId: string;
  createdBy: string;
}

const AllProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllProducts() {
      try {
        setLoading(true);
        const res = await fetch("/api/collections/all");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch products");
        }

        setProducts(data.products || []);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAllProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-red-500">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Error loading products</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full py-3">
      <div className="text-center mb-8">
        <Heading level={1} className="mb-2">
          All Products
        </Heading>
        <p className="text-gray-800 text-md md:text-lg">
          Total Products :{" "}
          <span className="font-semibold text-white bg-[#ffd400] rounded-full px-2 py-1">
            {products.length}
          </span>
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <CardLayout
              key={product.id}
              title={product.name}
              image1={product.media?.[0]}
              image2={product.media?.[1]}
              price={product.price}
              href={`/products/${product.handle}`}
              productCreatorId={product.createdBy}
              category={product.category}
              WishListIcon={
                <WishListIcon productId={product.id} entityType="product" />
              }
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AllProductsPage;
