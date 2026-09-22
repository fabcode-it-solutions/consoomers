"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { brandsService, Brand } from "@/services/brands";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import CreateBrandForm from "@/components/forms/CreateBrandForm";
import Image from "next/image";
import { useRouter } from "next/navigation";

const BrandsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getLogoSrc = (brand: Brand) => {
    // First try to get from brandCreate data if available

    if (brand.brandCreateData?.logoUrl) return brand.brandCreateData.logoUrl;
    if (brand.brandCreateData?.logo?.src) return brand.brandCreateData.logo.src;
    
    // Fallback to existing logo logic
    if (brand.logo) return brand.logo;
    if (typeof brand.preferences === 'object' && brand.preferences !== null) {
      const prefs = brand.preferences as { logo?: string };
      if (prefs.logo) return prefs.logo;
    }
    if (typeof brand.preferences === 'string') return brand.preferences;
    return "/assets/images/nologo.png";
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchBrands();
    }
  }, [session]);

  const fetchBrands = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await brandsService.getBrands(session.user.id);
      if (response.success) {
        setBrands(response.data);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandCreated = (newBrand: Brand) => {
    setBrands(prev => [...prev, newBrand]);
    setShowCreateForm(false);
  };

  if (!session) {
    return <div className="p-8">Please sign in to view your brands.</div>;
  }

  if (loading) {
    return <div className="p-8">Loading brands...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <Heading level={1} className="text-3xl font-bold">
          My Brands
        </Heading>
        {/* <Button className="text-white" onClick={() => router.push("/create-brand")}>
         Add Brand Details
        </Button> */}
      </div>

      {showCreateForm && (
        <div className="mb-8">
          <CreateBrandForm
            userId={session.user.id!}
            onSuccess={handleBrandCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {brands.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven&apos;t created any brands yet.</p>
          <Button className="text-white" onClick={() => router.push("/create-brand")}>
            Create Your First Brand
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div key={brand.id} onClick={() => router.push(`/brands/${brand.handle}`)} className="border rounded-md p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow bg-gray-50 hover:bg-gray-100">
              <div className="flex items-center gap-5">
              <Image
                src={getLogoSrc(brand)}
                alt={brand.brandName || "Currently No Logo Added"}
                width={120}
                height={120}
                className="w-[120px] h-[120px] object-cover rounded border "
              />
              <span className="">
              <h3 className="text-xl font-semibold mb-2">{brand.brandName}</h3>
              <p className="text-gray-700 mb-2">{brand.name}</p>
              
              {brand.industry && (
                <p className="text-sm text-gray-600 mb-2">Industry: {brand.industry}</p>
              )}
              {brand.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm"
                >
                  Visit Website
                </a>
              )}
              </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandsPage;