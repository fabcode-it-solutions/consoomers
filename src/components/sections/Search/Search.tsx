"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Product } from "@/db/type";
import CardLayout from "@/components/ui/CardLayout";
import WishListIcon from "@/assets/icon/WishListIcon";
import Spinner from "@/components/ui/Loader";

const Search = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initial states
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<string>(""); // "asc" or "desc"

  // 🔍 Fetch products when filters change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          ...(sortOrder && { sort: sortOrder }),
        });

        router.replace(`/search?${params.toString()}`);

        const res = await fetch(`/api/products/search?${params.toString()}`);
        const data = await res.json();
        setResults(data.products || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [query, sortOrder, router]);

  return (
    <div className="pt-12 px-4 md:px-10">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Search Products
        </h1>
        <p className="text-gray-500">
          Discover premium products with Consoomers.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-6 relative bg-white">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full border border-gray-300 rounded-md pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent text-gray-800 shadow-sm"
        />
      </div>

      {/* Category Buttons */}
      <div className="max-w-2xl mx-auto mb-10">
        <p className="text-gray-600 mb-3 text-center">Quick search by category:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "Beauty & Personal Care",
            "Fashion & Accessories", 
            "Tech & Electronics",
            "Food & Beverage",
            "Home & Garden",
            "Fitness & Wellness"
          ].map((category) => (
            <button
              key={category}
              onClick={() => setQuery(category)}
              className="px-4 py-2 hover:bg-gray-100 bg-gray-800 text-white hover:text-gray-700 rounded-md  border border-gray-300 hover:border-gray-800"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filters */}
      <div className="max-w-full mx-auto mb-10 flex flex-col sm:flex-row items-center justify-end gap-4">
         {query.trim() && (
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border border-gray-800 rounded px-2 py-2 focus:outline-none focus:ring-1 "
        >
          <option value="">Sort by Price</option>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
         )}
        

        {query.trim() && (
          <div className="text-gray-800 text-sm sm:text-lg">
            {loading ? (
            
              <Spinner className="w-6 h-6"/>
            ) : (
              <>
                <span className="font-bold text-red-800">{results.length}</span> result
                {results.length > 1 ? "s" : ""} found
              </>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto">
        {loading && (
          <div className="text-center text-gray-500">
            <Spinner className="w-20 h-20 flex items-center text-center mx-auto" />
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="text-center text-gray-500 text-lg mt-10">
            <p>🔍 No matching products found.</p>
            <p className="text-sm mt-1">Try another keyword .</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((product) => {
              const media = product.media as string[] | null;
              const isOwnProduct =
                session?.user?.id ===
                (product as Product & { brandUserId?: string }).brandUserId;
              return (
                <CardLayout
                  key={product.id}
                  title={product.name}
                  category={product.category || undefined}
                  image1={media?.[0]}
                  image2={media?.[1]}
                  price={product.price}
                  href={`/products/${product.handle}`}
                  productCreatorId={product.brandId}
                  WishListIcon={
                    !isOwnProduct ? (
                      <WishListIcon
                        productId={product.id}
                        entityType="product"
                      />
                    ) : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
