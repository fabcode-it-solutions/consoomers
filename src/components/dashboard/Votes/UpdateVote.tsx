/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// ManageVoteOptions.tsx
"use client";
import React, { useState, useEffect } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { SerchField } from "@/components/ui/dashboard/Search";
import PageHeader from "../PageHeader";
import {
  Plus,
  Trash2,
  Save,
  Search,
  Package,
  Vote,
  AlertCircle,
  CheckCircle,
  X,
  Edit2,
  MoreVertical,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface VoteOption {
  label: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  category?: string;
  price?: number;
  media?: Array<string | { src: string }>;
  voteOptions?: Array<VoteOption | string>;
  hasVotes?: boolean;
  adminManaged?: boolean;
}

interface Message {
  type: string;
  text: string;
}

// DeleteConfirmationDialog Component
const DeleteConfirmationDialog = ({
  productToDelete,
  setProductToDelete,
  confirmDelete,
  deleteLoading,
}: {
  productToDelete: Product | null;
  setProductToDelete: (v: Product | null) => void;
  confirmDelete: () => void;
  deleteLoading: boolean;
}) => {
  return (
    <AlertDialog.Root open={productToDelete !== null}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1a2332] border border-[#334155]  p-6 w-full max-w-md z-50">
          <AlertDialog.Title className="text-lg font-semibold mb-4 text-[#f1f5f9]">
            Delete Vote Options
          </AlertDialog.Title>
          <AlertDialog.Description className="text-[#94a3b8] mb-6">
            Are you sure you want to delete all vote options for &rdquo;
            <strong className="text-[#f1f5f9]">{productToDelete?.name}</strong>
            &rdquo;? This action cannot be undone.
          </AlertDialog.Description>
          <div className="flex gap-3 justify-end">
            <AlertDialog.Cancel asChild>
              <button
                className="px-4 py-2 border border-[#334155]  text-[#f1f5f9] hover:bg-[#334155]/50 transition-colors"
                onClick={() => setProductToDelete(null)}
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className="px-4 py-2 bg-red-600 text-white  hover:bg-red-700 disabled:opacity-50 transition-colors"
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

// Pagination Component
const Pagination = ({
  totalPages,
  currentPage,
  totalItems,
  setCurrentPage,
  hasPrev,
  hasNext,
  itemsPerPage,
}: {
  totalPages: number;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  hasPrev: boolean;
  hasNext: boolean;
  setCurrentPage: (v: number) => void;
}) => {
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between bg-[#1a2332] border-t border-[#334155] p-4">
      <div className="text-sm text-[#94a3b8]">
        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
        results
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrev}
          className="px-3 py-1 border border-[#334155]  text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0060FF]/10 text-[#94a3b8]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-sm text-[#94a3b8]">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNext}
          className="px-3 py-1 border border-[#334155]  text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0060FF]/10 text-[#94a3b8]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ManageVoteOptions = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [message, setMessage] = useState<Message>({ type: "", text: "" });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [voteOptions, setVoteOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(
    null
  );
  const [editingOptionText, setEditingOptionText] = useState<string>("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(20);

  useEffect(() => {
    fetchProductsWithVotes();
  }, []);

  const fetchProductsWithVotes = async (): Promise<void> => {
    setLoadingProducts(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(
        `/api/product/get-product?all=true&t=${timestamp}`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();

      const productsWithVotes = await Promise.all(
        (data.products || []).map(async (product: Product) => {
          try {
            const voteRes = await fetch(
              `/api/dashboard/vote-options?productId=${product.id}&t=${timestamp}`,
              { cache: "no-store" }
            );

            if (voteRes.ok) {
              const voteData = await voteRes.json();
              const options =
                voteData?.voteOptions?.options || voteData?.options || [];

              if (Array.isArray(options) && options.length > 0) {
                return {
                  ...product,
                  voteOptions: options,
                  hasVotes: true,
                  adminManaged: true,
                };
              }
            }
          } catch (err) {
            console.error("Error fetching votes for product:", product.id, err);
          }

          return null;
        })
      );

      setProducts(productsWithVotes.filter((p): p is Product => p !== null));
    } catch (error) {
      console.error("Error fetching products:", error);
      showMessage("error", "Network error fetching products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const categories: string[] = [
    "all",
    ...Array.from(
      new Set(products.map((p) => p.category).filter(Boolean) as string[])
    ),
  ];

  const filteredProducts = products.filter((product) => {
    const name = (product.name || "").toLowerCase();
    const cat = (product.category || "").toLowerCase();
    const s = searchTerm.toLowerCase().trim();
    const matchesSearch = !s || name.includes(s) || cat.includes(s);
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  useEffect(() => setCurrentPage(1), [searchTerm, categoryFilter]);

  const handleEdit = (product: Product): void => {
    setEditingProduct(product);
    const optionLabels: string[] = (product.voteOptions || [])
      .map((opt) =>
        typeof opt === "string"
          ? opt
          : (opt as VoteOption).label || (opt as VoteOption).value || ""
      )
      .filter(Boolean);
    setVoteOptions(optionLabels);
    setNewOption("");
    setOpenDropdown(null);
    setEditingOptionIndex(null);
    setEditingOptionText("");
  };

  const handleAddOption = (): void => {
    if (newOption.trim()) {
      setVoteOptions([...voteOptions, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number): void => {
    setVoteOptions(voteOptions.filter((_, i) => i !== index));
  };

  const handleEditOption = (index: number): void => {
    setEditingOptionIndex(index);
    setEditingOptionText(voteOptions[index] || "");
  };

  const handleSaveOptionEdit = (): void => {
    if (editingOptionText.trim() && editingOptionIndex !== null) {
      const updatedOptions = [...voteOptions];
      updatedOptions[editingOptionIndex] = editingOptionText.trim();
      setVoteOptions(updatedOptions);
      setEditingOptionIndex(null);
      setEditingOptionText("");
    }
  };

  const handleCancelOptionEdit = (): void => {
    setEditingOptionIndex(null);
    setEditingOptionText("");
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!editingProduct) return;
    if (voteOptions.length === 0)
      return showMessage("error", "Add at least one option");

    setSaving(true);
    try {
      const response = await fetch("/api/dashboard/vote-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: editingProduct.id,
          options: voteOptions.map((opt) => ({ label: opt, value: opt })),
        }),
      });

      if (response.ok) {
        showMessage("success", "Vote options updated!");
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  voteOptions: voteOptions.map((opt) => ({
                    label: opt,
                    value: opt,
                  })),
                  hasVotes: true,
                }
              : p
          )
        );
        handleCancelEdit();
        await fetchProductsWithVotes();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showMessage(
          "error",
          errorData?.error || "Failed to update vote options"
        );
      }
    } catch (err) {
      console.error(err);
      showMessage("error", "Network error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (product: Product): void => {
    setProductToDelete(product);
    setOpenDropdown(null);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!productToDelete) return;

    setDeleteLoading(true);

    try {
      const response = await fetch("/api/dashboard/vote-options", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productToDelete.id }),
      });

      if (response.ok) {
        showMessage("success", "Vote options deleted successfully!");
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        setProductToDelete(null);
        await fetchProductsWithVotes();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showMessage("error", errorData?.error || "Failed to delete options");
      }
    } catch (err) {
      console.error(err);
      showMessage("error", "Network error. Try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelEdit = (): void => {
    setEditingProduct(null);
    setVoteOptions([]);
    setNewOption("");
    setEditingOptionIndex(null);
    setEditingOptionText("");
  };

  const showMessage = (type: string, text: string): void => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0060FF]/10 flex items-center justify-center ">
              <Vote className="w-6 h-6 text-[#0060FF]" />
            </div>
            {/* <div>
              <h1 className="text-2xl font-bold text-[#f1f5f9]">
                Manage Vote Options
              </h1>
              <p className="text-[#94a3b8] text-sm mt-1">
                View, edit, or delete vote options
              </p>
            </div> */}
            <PageHeader
              heading="Manage Vote Options"
              describe="View, edit, or delete vote options"
            />
          </div>

          <button
            onClick={fetchProductsWithVotes}
            disabled={loadingProducts}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a2332] border border-[#334155] text-[#f1f5f9]  hover:bg-[#0060FF]/10 hover:border-[#0060FF]/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingProducts ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`flex items-center gap-3 p-4 border  ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
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

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          productToDelete={productToDelete}
          setProductToDelete={setProductToDelete}
          confirmDelete={confirmDelete}
          deleteLoading={deleteLoading}
        />

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
            className="px-4 bg-gray-800 border border-[#334155]  text-[#f1f5f9] focus:outline-none focus:border-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Products Table */}
        {loadingProducts ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#0060FF] animate-spin mb-4" />
            <p className="text-[#94a3b8]">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-[#1a2332] border border-[#334155]  p-12 text-center">
            <Package className="w-16 h-16 text-[#334155] mx-auto mb-4" />
            <p className="text-[#94a3b8] text-lg font-medium">
              No products with vote options found
            </p>
          </div>
        ) : (
          <div className="bg-[#1a2332] border border-[#334155]  overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0f1623] border-b border-[#334155]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                      Vote Options
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {paginatedProducts.map((product) => {
                    const opts = Array.isArray(product.voteOptions)
                      ? product.voteOptions
                      : [];
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-[#0f1623] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.media?.[0] && (
                              <img
                                src={
                                  typeof product.media[0] === "string"
                                    ? product.media[0]
                                    : (product.media[0] as any)?.src
                                }
                                alt={product.name}
                                className="w-12 h-12 object-cover "
                              />
                            )}
                            <div>
                              <div className="text-[#f1f5f9] font-medium">
                                {product.name}
                              </div>
                              {product.price && (
                                <div className="text-[#94a3b8] text-sm">
                                  ${product.price}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#94a3b8]">
                          {product.category || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2 max-w-md">
                            {opts.slice(0, 3).map((opt, idx) => {
                              const label =
                                typeof opt === "string"
                                  ? opt
                                  : (opt as VoteOption).label ||
                                    (opt as VoteOption).value ||
                                    String(opt);
                              return (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-[#0060FF]/10 text-[#0060FF] text-xs "
                                >
                                  {label}
                                </span>
                              );
                            })}
                            {opts.length > 3 && (
                              <span className="px-2 py-1 bg-[#334155] text-[#94a3b8] text-xs ">
                                +{opts.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[#f1f5f9] font-semibold">
                            {opts.length}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === product.id
                                    ? null
                                    : product.id
                                )
                              }
                              className="p-2 hover:bg-[#334155]  transition-colors"
                            >
                              <MoreVertical className="w-5 h-5 text-[#94a3b8]" />
                            </button>

                            {openDropdown === product.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenDropdown(null)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-[#0f1623] border border-[#334155]  shadow-lg z-20">
                                  <button
                                    onClick={() => handleEdit(product)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[#f1f5f9] hover:bg-[#334155] transition-colors text-left "
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Options
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(product)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-left "
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Options
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              hasPrev={hasPrev}
              hasNext={hasNext}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}

        {/* Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a2332] border border-[#334155]  max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#334155] flex items-center justify-between sticky top-0 bg-[#1a2332] z-10">
                <div>
                  <h2 className="text-xl font-semibold text-[#f1f5f9]">
                    Edit Vote Options
                  </h2>
                  <p className="text-sm text-[#94a3b8] mt-1">
                    {editingProduct.name}
                  </p>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-[#334155]  transition-colors"
                >
                  <X className="w-5 h-5 text-[#94a3b8]" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddOption()}
                    placeholder="Add a new vote option..."
                    className="flex-1 px-4 py-3 bg-[#0f1623] border border-[#334155]  text-[#f1f5f9] placeholder-[#94a3b8] focus:outline-none focus:border-[#0060FF]/50"
                  />
                  <button
                    onClick={handleAddOption}
                    disabled={!newOption.trim()}
                    className="px-6 py-3 bg-[#0060FF] text-white  hover:bg-[#0060FF]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {voteOptions.length > 0 ? (
                  <div className="space-y-2">
                    {voteOptions.map((option, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 bg-[#0f1623] border border-[#334155]  group hover:border-[#0060FF]/30 transition-colors"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-[#0060FF]/10  flex items-center justify-center">
                          <span className="text-[#0060FF] font-semibold text-sm">
                            {i + 1}
                          </span>
                        </div>

                        {editingOptionIndex === i ? (
                          <>
                            <input
                              type="text"
                              value={editingOptionText}
                              onChange={(e) =>
                                setEditingOptionText(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveOptionEdit();
                                if (e.key === "Escape")
                                  handleCancelOptionEdit();
                              }}
                              className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#0060FF]  text-[#f1f5f9] focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={handleSaveOptionEdit}
                              className="p-2 text-green-400 hover:bg-green-500/10  transition-all"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelOptionEdit}
                              className="p-2 text-[#94a3b8] hover:bg-[#334155]  transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1 text-[#f1f5f9]">
                              {option}
                            </div>
                            <button
                              onClick={() => handleEditOption(i)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-[#0060FF] hover:bg-[#0060FF]/10 "
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveOption(i)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/10 "
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#94a3b8] text-sm bg-[#0f1623]  border border-[#334155]">
                    No vote options. Add some above.
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-6 py-3 bg-[#334155] text-[#f1f5f9]  hover:bg-[#334155]/80 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving || voteOptions.length === 0}
                    className="flex-1 px-6 py-3 bg-[#0060FF] text-white  hover:bg-[#0060FF]/90 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 font-semibold"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageVoteOptions;
