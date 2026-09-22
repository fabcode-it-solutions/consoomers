/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import DialogPopup from "@/components/ui/DialogPopup";
import { useSession } from "next-auth/react";


interface Media {
  id: string;
  src: string;
  alt?: string;
  name?: string;
  key?: string;
  type?: string;
}

interface Product {
  url: string;
  media: Media[];
}

interface Note {
  by: string;
  text: string;
  addedAt: string;
}

interface Brand {
  id: string;
  brandName: string;
  countryFounded: string;
  currentOwnership: string;
  status: "pending" | "approved" | "rejected" | "reviewed";
  notes?: Note[];
  logo?: Media;
  brandMedia?: Media[];
  productData?: Product[];
}

interface BrandDetailProps {
  brandId: string;
}

export default function BrandDetail({ brandId }: BrandDetailProps) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "approved" | "rejected" | "reviewed" | null
  >(null);
  const [notes, setNotes] = useState("");
  const { data: session } = useSession();
  const userId = session?.user?.id;
  useEffect(() => {
    if (!brandId) return;

    const fetchBrand = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/dashboard/brand/${brandId}`);
        const data = await res.json();
        console.log("Brand Data:", data);

        if (res.ok && data.success) {
          setBrand(data.data as Brand);
        } else {
          toast.error(data.message || "Failed to fetch brand details");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching brand");
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [brandId]);

  // Update brand status (unchanged)
  const updateBrandStatus = async (
    status: "pending" | "approved" | "rejected" | "reviewed",
    notes: string
  ) => {
    if (!brand?.id) return toast.error("Missing brand id");
    if (!userId) return toast.error("Missing user id");

    try {
      setUpdating(true);
      const payload = { brandId: brand.id, userId, status, notes };
      const res = await fetch(
        "/api/auth/register/brand/brand-request/review-request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        console.error("API error:", errData);
        toast.error(errData.error || "Failed to update brand status");
        return;
      }

      toast.success("Brand status updated successfully");
      setBrand((prev) => (prev ? { ...prev, status } : prev));
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
      setOpenDialog(false);
      setSelectedAction(null);
      setNotes("");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedAction) {
      toast.error("No action selected");
      return;
    }

    await updateBrandStatus(selectedAction, notes);
  };

  if (loading && !brand)
    return <p className="text-gray-400 p-8">Loading brand details...</p>;
  if (!brand) return <p className="text-gray-400 p-8">Brand not found</p>;

  return (
    <section className="max-w-[1400px] mt-4 p-6 space-y-6 rounded-lg shadow-xl">
      {/* Brand Header (unchanged) */}
      <div className="flex flex-row md:flex-col items-start gap-6 pb-6 border-gray-700 bg-[#1a2332] p-6">
        <div className="flex flex-row gap-40 w-full">
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-white mb-3">
              {brand.brandName}
            </h1>
            <p className="text-sm text-gray-300 mb-3">
              <span className="text-gray-400">Country Founded:</span>{" "}
              <strong className="text-white">{brand.countryFounded}</strong>{" "}
              <span className="text-gray-600 mx-2">|</span>{" "}
              <span className="text-gray-400">Ownership:</span>{" "}
              <strong className="text-white">{brand.currentOwnership}</strong>
            </p>
            <div className="flex items-center gap-2">
              <strong className="text-gray-400 text-sm">Status:</strong>{" "}
              <span
                className={`px-3 py-1 text-xs font-semibold ${
                  brand.status === "approved"
                    ? "bg-green-900/50 text-green-300 border border-green-700"
                    : brand.status === "rejected"
                    ? "bg-red-900/50 text-red-300 border border-red-700"
                    : brand.status === "reviewed"
                    ? "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                    : "bg-gray-700/50 text-gray-300 border border-gray-600"
                }`}
              >
                {brand.status.toUpperCase()}
              </span>
            </div>
          </div>
          {brand.logo?.src && (
            <img
              src={brand.logo.src}
              alt={brand.brandName}
              className="w-24 h-24  object-contain flex-shrink-0"
            />
          )}
        </div>
        <div className="flex gap-3 pt-4 items-center border-t border-gray-700 w-full">
          {brand.status !== "approved" && (
            <Button
              className="bg-green-600 text-white hover:bg-green-700 font-medium transition-colors"
              onClick={() => {
                setSelectedAction("approved");
                setOpenDialog(true);
              }}
            >
              Approve
            </Button>
          )}
          {brand.status !== "rejected" && (
            <Button
              className="bg-red-600 text-white hover:bg-red-700 font-medium transition-colors"
              onClick={() => {
                setSelectedAction("rejected");
                setOpenDialog(true);
              }}
            >
              Reject
            </Button>
          )}
          {brand.status !== "reviewed" && (
            <Button
              className="bg-yellow-600 text-white hover:bg-yellow-700 font-medium transition-colors"
              onClick={() => {
                setSelectedAction("reviewed");
                setOpenDialog(true);
              }}
            >
              Reviewed
            </Button>
          )}
        </div>
      </div>

  {/* <div className="">
      {brand.brandMedia && brand.brandMedia.length > 0 && (
        <div className="pb-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Brand Images</h2>
          <div className="flex flex-col gap-4">

            <CustomSwiper
              slidesPerView={1}
              spaceBetween={10}
              showNavigation={false}
              onSwiper={setBrandMainSwiper}
            >
              {brand.brandMedia.map((mediaItem, idx) => (
                <div key={mediaItem.id} className="w-[500px] h-full overflow-hidden">
                  <img
                    src={mediaItem.src}
                    alt={mediaItem.alt || brand.brandName}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </CustomSwiper>
          
           
          </div>
        </div>
      )}
</div>
<div>
      {brand.productData && brand.productData.length > 0 && (
        <div className="pb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Products</h2>
          {brand.productData.map((product, index) => (
            <div
              key={index}
              className="border border-gray-700 rounded-lg p-4 bg-[#0f1623] shadow-sm mt-4"
            >
              {product.media && product.media.length > 0 && (
                <div className="flex flex-col gap-4">
                
                  <CustomSwiper
                    slidesPerView={1}
                    spaceBetween={10}
                    showNavigation={false}
                    onSwiper={setProductMainSwiper}
                  >
                    {product.media.map((m, i) => (
                      <div key={i} className="w-[500px] h-full overflow-hidden">
                        <img
                          src={m.src}
                          alt={m.alt || "Product image"}
                          className=" h-auto object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </CustomSwiper>
                
                </div>
              )}
            </div>
          ))}
        </div>
      )}
</div> */}


  {brand.brandMedia && brand.brandMedia.length > 0 && (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold text-white mb-2">Brand Images</h2>
      <div className="flex flex-row flex-wrap gap-4">
        {brand.brandMedia.map((mediaItem) => (
          <div
            key={mediaItem.id}
            className="w-[400px] h-[450px] overflow-hidden "
          >
            <img
              src={mediaItem.src}
              alt={mediaItem.alt || brand.brandName}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  )}


  {brand.productData &&
    brand.productData.length > 0 &&
    brand.productData.map((product, index) =>
      product.media && product.media.length > 0 ? (
        <div key={index} className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-white mb-2">
            Product {index + 1}
          </h2>
          <div className="flex flex-row flex-wrap gap-4">
            {product.media.map((m, i) => (
              <div
                key={i}
                className="w-[400px] h-[450px] overflow-hidden "
              >
                <img
                  src={m.src}
                  alt={m.alt || "Product image"}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null
    )}



      {/* Dialog (unchanged) */}
      <DialogPopup
        mode="dark"
        heading={
          selectedAction === "approved"
            ? "Approve Brand"
            : selectedAction === "rejected"
            ? "Reject Brand"
            : "Mark as Reviewed"
        }
        open={openDialog}
        setShowCreateModal={setOpenDialog}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <label className="text-gray-300 font-medium">
              Add Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any notes or comments..."
              className="border border-gray-600 bg-[#0f1623] text-white placeholder-gray-500 p-3 rounded-lg w-full min-h-[120px] focus:outline-none focus:border-blue-500 resize-none"
            />

            <div className="flex gap-3 mt-4 justify-end">
              <Button
                type="button"
                className=" border-gray-600 bg-gray-700 text-white hover:bg-gray-600 font-medium transition-colors"
                onClick={() => {
                  setOpenDialog(false);
                  setSelectedAction(null);
                  setNotes("");
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className=" text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </form>
        </div>
      </DialogPopup>
    </section>
  );
}
