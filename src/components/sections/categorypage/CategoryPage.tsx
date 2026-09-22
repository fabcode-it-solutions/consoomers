"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CardLayout from '@/components/ui/CardLayout';
import WishListIcon from '@/assets/icon/WishListIcon';
import Spinner from '@/components/ui/Loader';
import Container from '@/components/ui/Container';
import Heading from '@/components/ui/Heading';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  media: string[];
  handle: string;
  price: string;
  brandUserId: string;
}

const CategoryPage = () => {
  const params = useParams();
  const category = params?.category as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Convert URL slug to proper category name
        const categoryName = formatCategoryTitle(category);
        console.log('Category URL param:', category);
        console.log('Formatted category name:', categoryName);
        
        // First try: Search by exact category
        const categoryUrl = `/api/products/search?category=${encodeURIComponent(categoryName)}`;
        console.log('Category API URL:', categoryUrl);
        
        const categoryResponse = await fetch(categoryUrl);
        const categoryData = await categoryResponse.json();
        
        console.log('Category API Response:', categoryData);

        if (categoryResponse.ok && categoryData?.products && categoryData.products.length > 0) {
          setProducts(categoryData.products);
        } else {
          // Second try: Search by keywords if no category match found
          const keywords = extractKeywords(categoryName);
          console.log('Extracted keywords:', keywords);
          
          if (keywords.length > 0) {
            const keywordUrl = `/api/products/search?q=${encodeURIComponent(keywords[0])}`;
            console.log('Keyword API URL:', keywordUrl);
            
            const keywordResponse = await fetch(keywordUrl);
            const keywordData = await keywordResponse.json();
            
            console.log('Keyword API Response:', keywordData);
            
            if (keywordResponse.ok && keywordData?.products) {
              setProducts(keywordData.products);
            } else {
              setProducts([]);
            }
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const formatCategoryTitle = (cat: string) => {
    // Map URL slugs to exact category names
    const categoryMap: { [key: string]: string } = {
      'beauty-personal-care': 'Beauty & Personal Care',
      'fashion-accessories': 'Fashion & Accessories',
      'tech-electronics': 'Tech & Electronics',
      'food-beverage': 'Food & Beverage',
      'home-garden': 'Home & Garden',
      'fitness-wellness': 'Fitness & Wellness',
      'hair-care': 'Hair Care',
    };
    
    return categoryMap[cat] || cat
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const extractKeywords = (categoryName: string): string[] => {
    // Extract meaningful keywords from category names for fallback search
    const keywordMap: { [key: string]: string[] } = {
      'Hair Care': ['hair'],
      'Beauty & Personal Care': ['beauty', 'personal', 'care'],
      'Fashion & Accessories': ['fashion', 'accessories'],
      'Tech & Electronics': ['tech', 'electronics'],
      'Food & Beverage': ['food', 'beverage'],
      'Home & Garden': ['home', 'garden'],
      'Fitness & Wellness': ['fitness', 'wellness'],
    };
    
    return keywordMap[categoryName] || categoryName.toLowerCase().split(' ').filter(word => word.length > 2);
  };

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center h-[70vh]">
          <Spinner className="w-12 h-12" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="flex justify-center items-center h-[70vh] text-red-500">
          <div className="text-center">
            <p className="text-xl font-semibold mb-2">Error loading products</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8 text-center">
          <Heading>
            {formatCategoryTitle(category || '')}
          </Heading>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl text-gray-500 mb-2">No products found</p>
            <p className="text-gray-400 text-xl px-5 sm:px-0">
              There are currently no products in the {formatCategoryTitle(category || '').toLowerCase()} category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <CardLayout
                key={product.id}
                title={product.name}
                category={product.category}
                image1={product.media?.[0]}
                image2={product.media?.[1]}
                price={product.price}
                href={`/products/${product.handle}`}
                productCreatorId={product.brandUserId}
                WishListIcon={
                  <WishListIcon productId={product.id} entityType="product" />
                }
              />
            ))}
          </div>
        )}
      </div>
     </Container>
  );
};

export default CategoryPage;
