/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import PageHeader from "../PageHeader";
import { SerchField } from "@/components/ui/dashboard/Search";
import {
  Plus,
  Trash2,
  Save,
  Search,
  Package,
  Vote,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Check,
} from "lucide-react";

// Types
interface Product {
  id: string;
  name: string;
  category?: string;
  price?: string | number;
  media?: Array<string | { src: string }>;
}

interface VoteOption {
  label: string;
  value: string;
}

// Delete Option Confirmation Dialog
const DeleteOptionDialog = ({
  optionToDelete,
  setOptionToDelete,
  confirmDelete,
}: {
  optionToDelete: { index: number; text: string } | null;
  setOptionToDelete: (v: { index: number; text: string } | null) => void;
  confirmDelete: () => void;
}) => {
  return (
    <AlertDialog.Root open={optionToDelete !== null}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1a2332] border border-[#334155]  p-6 w-full max-w-md z-[70]">
          <AlertDialog.Title className="text-lg font-semibold mb-4 text-[#f1f5f9]">
            Delete Vote Option
          </AlertDialog.Title>
          <AlertDialog.Description className="text-[#94a3b8] mb-6">
            Are you sure you want to delete the option &rdquo;<strong className="text-[#f1f5f9]">{optionToDelete?.text}</strong>&rdquo;?
          </AlertDialog.Description>
          <div className="flex gap-3 justify-end">
            <AlertDialog.Cancel asChild>
              <button
                className="px-4 py-2 border border-[#334155]  text-[#f1f5f9] hover:bg-[#334155]/50 transition-colors"
                onClick={() => setOptionToDelete(null)}
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className="px-4 py-2 bg-red-600 text-white  hover:bg-red-700 transition-colors"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

// CardLayout Component
const CardLayout = ({
  title,
  category,
  image1,
  image2,
  price,
  isSelected,
  onToggleSelect,
  imgHeight = "h-[300px]",
}: {
  title: string;
  category?: string;
  image1?: string;
  image2?: string;
  price?: string;
  isSelected: boolean;
  onToggleSelect: () => void;
  imgHeight?: string;
}) => {
  return (
    <div className="bg-white flex flex-col overflow-hidden group h-full duration-300 relative">
      <div
        onClick={onToggleSelect}
        className={`absolute inset-0 z-10 cursor-pointer transition-all duration-300 ${
          isSelected
            ? "bg-[#0060FF]/10 ring-4 ring-[#0060FF]"
            : "hover:bg-black/5"
        }`}
      >
        <div
          className={`absolute top-4 right-4 w-8 h-8 border-4 flex items-center justify-center  transition-all ${
            isSelected
              ? "bg-[#0060FF] border-gray-300 scale-110"
              : "bg-white border-gray-300"
          }`}
        >
          {isSelected && <Check className="w-5 h-5 text-white" />}
        </div>
      </div>

      <div className="relative w-full">
        {image1 ? (
          <>
            <img
              src={image1}
              alt={title}
              className={`w-full object-cover transition-opacity duration-500 ease-in-out ${imgHeight}`}
            />
            {image2 && (
              <img
                src={image2}
                alt={title}
                className={`absolute top-0 left-0 w-full ${imgHeight} object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out`}
              />
            )}
          </>
        ) : (
          <div
            className={`w-full ${imgHeight} bg-gray-200 flex items-center justify-center`}
          >
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      <div className="bg-[#F3F3F3] p-[1rem] h-full">
        {category && (
          <p className="font-bold text-lg text-[#151515] mb-1">{category}</p>
        )}
        <h2 className="text-base font-medium text-[#151515] mb-2 line-clamp-2">
          {title}
        </h2>
        {price && (
          <p className="font-normal mb-3 text-[#151515]">
            Retail Price <b className="font-semibold">${price}</b>
          </p>
        )}
      </div>
    </div>
  );
};

const VoteOptionsAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [voteOptions, setVoteOptions] = useState<(string | VoteOption)[]>([]);
  const [newOption, setNewOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<{ index: number; text: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch("/api/product/get-product?all=true");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        showMessage("error", "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showMessage("error", "Network error fetching products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const displayedProducts = showAll
    ? filteredProducts
    : filteredProducts.slice(0, 20);
  const hasMore = filteredProducts.length > 20;

  useEffect(() => {
    if (selectedProducts.length === 1) {
      fetchVoteOptions(selectedProducts[0].id);
    } else if (selectedProducts.length === 0) {
      setVoteOptions([]);
    }
  }, [selectedProducts]);

  const fetchVoteOptions = async (productId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/dashboard/vote-options?productId=${productId}`
      );
      if (response.ok) {
        const data = await response.json();
        const opts = data.voteOptions?.options || [];
        const normalized: (string | VoteOption)[] = opts.map((opt: any) =>
          typeof opt === "object" && opt !== null
            ? {
                label: opt.label || opt.value || "",
                value: opt.value || opt.label || "",
              }
            : String(opt)
        );
        setVoteOptions(normalized);
      } else {
        setVoteOptions([]);
      }
    } catch (error) {
      console.error("Error fetching vote options:", error);
      setVoteOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProduct = (product: Product) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p.id === product.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts);
    }
  };

  const handleConfigureVotes = () => {
    if (selectedProducts.length === 0) {
      showMessage("error", "Please select at least one product");
      return;
    }
    setShowModal(true);
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setVoteOptions([...voteOptions, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleDeleteOptionClick = (index: number) => {
    const option = voteOptions[index];
    const text = typeof option === "string" ? option : option.label || option.value || "";
    setOptionToDelete({ index, text });
  };

  const confirmDeleteOption = () => {
    if (optionToDelete !== null) {
      setVoteOptions(voteOptions.filter((_, i) => i !== optionToDelete.index));
      setOptionToDelete(null);
    }
  };

  const handleSaveOptions = async () => {
    if (selectedProducts.length === 0) {
      showMessage("error", "Please select at least one product");
      return;
    }
    if (voteOptions.length === 0) {
      showMessage("error", "Please add at least one vote option");
      return;
    }

    setSaving(true);
    try {
      const normalizedOptions: VoteOption[] = voteOptions.map((opt) => {
        if (typeof opt === "string") return { label: opt, value: opt };
        return { label: opt.label, value: opt.value };
      });

      const savePromises = selectedProducts.map((product) =>
        fetch("/api/dashboard/vote-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            options: normalizedOptions,
          }),
        })
      );

      const results = await Promise.all(savePromises);
      const allSuccessful = results.every((res) => res.ok);

      if (allSuccessful) {
        showMessage(
          "success",
          `Vote options saved successfully for ${
            selectedProducts.length
          } product${selectedProducts.length > 1 ? "s" : ""}!`
        );
        setSelectedProducts([]);
        setVoteOptions([]);
        setShowModal(false);
      } else {
        showMessage("error", "Some products failed to save. Please try again.");
      }
    } catch (error) {
      console.error("Error saving vote options:", error);
      showMessage("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0060FF]/10  flex items-center justify-center">
            <Vote className="w-6 h-6 text-[#0060FF]" />
          </div>
          {/* <div>
            <h1 className="text-2xl font-bold text-[#f1f5f9]">
              Vote Options Management
            </h1>
            <p className="text-[#94a3b8] text-sm mt-1">
              Select products and configure voting options
            </p>
          </div> */}
           <PageHeader
                    heading="Vote Options Management"
                    describe="Select products and configure voting options"
                  />
        </div>

        {/* Alert Message */}
        {message.text && (
          <div
            className={`flex items-center gap-3 p-4  border ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
            <button
              onClick={() => setMessage({ type: "", text: "" })}
              className="ml-auto hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Delete Option Confirmation */}
        <DeleteOptionDialog
          optionToDelete={optionToDelete}
          setOptionToDelete={setOptionToDelete}
          confirmDelete={confirmDeleteOption}
        />

        {/* Vote Options Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a2332] border border-[#334155]  max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#334155] flex items-center justify-between sticky top-0 bg-[#1a2332] z-10">
                <div className="flex items-center gap-2">
                  <Vote className="w-5 h-5 text-[#0060FF]" />
                  <div>
                    <h2 className="text-xl font-semibold text-[#f1f5f9]">
                      Vote Options Configuration
                    </h2>
                    <p className="text-sm text-[#94a3b8] mt-1">
                      {selectedProducts.length} product
                      {selectedProducts.length > 1 ? "s" : ""} selected
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-[#334155]  transition-colors"
                >
                  <X className="w-5 h-5 text-[#94a3b8]" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {selectedProducts.length > 1 && (
                  <div className="bg-blue-500/10 border border-blue-500/30  p-3">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-300">
                        Vote options will be applied to all {selectedProducts.length} selected products
                      </p>
                    </div>
                  </div>
                )}

                {/* Add Option Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddOption()}
                    placeholder="Enter a vote option..."
                    className="flex-1 px-4 py-3 bg-[#0f1623] border border-[#334155]  text-[#f1f5f9] placeholder-[#94a3b8] focus:outline-none focus:border-[#0060FF]/50"
                  />
                  <button
                    onClick={handleAddOption}
                    disabled={!newOption.trim()}
                    className="px-6 py-3 bg-[#0060FF] text-white  hover:bg-[#0060FF]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {/* Options List */}
                {voteOptions.length > 0 ? (
                  <div className="space-y-2">
                    {voteOptions.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-[#0f1623] border border-[#334155]  group hover:border-[#0060FF]/30 transition-colors"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-[#0060FF]/10  flex items-center justify-center">
                          <span className="text-[#0060FF] font-semibold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 text-[#f1f5f9]">
                          {typeof option === "string"
                            ? option
                            : option.label || option.value || ""}
                        </div>
                        <button
                          onClick={() => handleDeleteOptionClick(index)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/10  transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#94a3b8] text-sm bg-[#0f1623]  border border-[#334155]">
                    No vote options added yet
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 bg-[#334155] text-[#f1f5f9]  hover:bg-[#334155]/80 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveOptions}
                    disabled={saving || voteOptions.length === 0}
                    className="flex-1 px-6 py-3 bg-[#0060FF] text-white  hover:bg-[#0060FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save for {selectedProducts.length} Product
                        {selectedProducts.length > 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-[#334155]  text-[#f1f5f9] placeholder-[#94a3b8] focus:outline-none focus:border-[#0060FF]/50"
            /> */}
            <div className="flex-1">
                        <SerchField
                          name="search"
                          type="text"
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 border bg-gray-800 border-[#334155]  text-[#f1f5f9] focus:outline-none focus:border-[#0060FF]/50"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          <button
            onClick={handleSelectAll}
            className="px-6 border border-[#334155] text-[#f1f5f9]  hover:bg-[#0060FF]/10 hover:border-[#0060FF]/90 transition-colors"
          >
            {selectedProducts.length === filteredProducts.length &&
            filteredProducts.length > 0
              ? "Deselect All"
              : "Select All"}
          </button>

          {selectedProducts.length > 0 && (
            <button
              onClick={handleConfigureVotes}
              className="px-6 py-3 bg-[#0060FF] text-white  hover:bg-[#0060FF]/90 transition-colors font-semibold flex items-center gap-2"
            >
              <Vote className="w-4 h-4" />
              Configure ({selectedProducts.length})
            </button>
          )}
        </div>

        {/* Products Grid */}
        {loadingProducts ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#0060FF] animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-[#1a2332] border border-[#334155]  p-12 text-center">
            <Package className="w-16 h-16 text-[#334155] mx-auto mb-4" />
            <p className="text-[#94a3b8] text-lg">No products found</p>
            <p className="text-[#94a3b8] text-sm mt-2">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <CardLayout
                  key={product.id}
                  title={product.name || "Untitled Product"}
                  category={product.category}
                  image1={
                    typeof product.media?.[0] === "string"
                      ? product.media[0]
                      : product.media?.[0]?.src
                  }
                  image2={
                    typeof product.media?.[1] === "string"
                      ? product.media[1]
                      : product.media?.[1]?.src
                  }
                  price={product.price?.toString()}
                  isSelected={selectedProducts.some((p) => p.id === product.id)}
                  onToggleSelect={() => handleToggleProduct(product)}
                />
              ))}
            </div>

            {hasMore && !showAll && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={() => setShowAll(true)}
                  className="px-8 py-3 bg-[#0060FF] text-white  hover:bg-[#0060FF]/90 transition-colors font-semibold"
                >
                  Show More ({filteredProducts.length - 12} more products)
                </button>
              </div>
            )}

            {showAll && hasMore && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={() => setShowAll(false)}
                  className="px-8 py-3 bg-[#334155] text-[#f1f5f9]  hover:bg-[#334155]/80 transition-colors font-semibold"
                >
                  Show Less
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VoteOptionsAdmin;