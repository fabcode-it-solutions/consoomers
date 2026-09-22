"use client"
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import Container from "@/components/ui/Container";
import Spinner from "@/components/ui/Loader";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  media: string[];
  price : string
  handle : string
}
const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product/get-product"); 
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        console.log(data,"data>>>>>")
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {return (
  <div className="flex justify-center items-center h-screen">
        <Spinner className="w-12 h-12" />
      </div>
  )}
  if (!products.length) return <p>No products found.</p>;

  return (
    <Container bgColor="white" className="gap-6 mt-10 bg-white grid sm:grid-cols-2 md:grid-cols-3 ">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} productId={product.id} />
      ))}
    </Container>
  );
};
export default ProductList;
