/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Search,
  Power,
  PowerOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category?: string;
  price?: number;
  media?: Array<string | { src: string }>;
  sampleRequestsEnabled?: boolean;
}

interface Message {
  type: "success" | "error" | "";
  text: string;
}

const SampleRequestsToggleDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<Message>({ type: "", text: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/product/get-product?all=true&t=${timestamp}`, {
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      showMessage("error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Get unique categories
  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[])),
  ];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      product.category?.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "enabled" && product.sampleRequestsEnabled !== false) ||
      (statusFilter === "disabled" && product.sampleRequestsEnabled === false);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(paginatedProducts.map((p) => p.id)));
    }
  };

  const handleToggleSingle = async (productId: string, currentState: boolean) => {
    setUpdating((prev) => new Set(prev).add(productId));

    try {
      const response = await fetch("/api/dashboard/sample-request/sample-requests-toggle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          enabled: !currentState,
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      const data = await response.json();
      
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, sampleRequestsEnabled: !currentState } : p
        )
      );

      showMessage("success", data.message);
    } catch (error) {
      console.error("Error toggling product:", error);
      showMessage("error", "Failed to update setting");
    } finally {
      setUpdating((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleBulkToggle = async (enable: boolean) => {
    if (selectedProducts.size === 0) {
      showMessage("error", "Please select at least one product");
      return;
    }

    const productIds = Array.from(selectedProducts);
    setUpdating(new Set(productIds));

    try {
      const response = await fetch("/api/dashboard/sample-request/sample-requests-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds,
          enabled: enable,
        }),
      });

      if (!response.ok) throw new Error("Failed to bulk update");

      const data = await response.json();

      setProducts((prev) =>
        prev.map((p) =>
          productIds.includes(p.id) ? { ...p, sampleRequestsEnabled: enable } : p
        )
      );

      showMessage("success", data.message);
      setSelectedProducts(new Set());
    } catch (error) {
      console.error("Error bulk updating:", error);
      showMessage("error", "Failed to update products");
    } finally {
      setUpdating(new Set());
    }
  };

  return (
    <div className="bg-[#1a2332] min-h-screen">
      <div className=" p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#f1f5f9] mb-2">Sample Requests Control</h1>
            <p className="text-[#94a3b8]">Enable or disable sample requests for products</p>
          </div>
{/*           
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a2332] border border-[#334155] text-[#f1f5f9] hover:bg-[#334155]/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button> */}
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`flex items-center gap-3 p-4 mb-6 border ${
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
            <p className="text-sm flex-1">{message.text}</p>
            <button onClick={() => setMessage({ type: "", text: "" })}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-[#1a2332] border border-[#334155] text-[#f1f5f9] placeholder-[#94a3b8] focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-[#1a2332] border border-[#334155] text-[#f1f5f9] focus:outline-none focus:border-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-[#1a2332] border border-[#334155] text-[#f1f5f9] focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.size > 0 && (() => {
          const selectedProductsArray = Array.from(selectedProducts);
          const selectedProductsData = products.filter(p => selectedProductsArray.includes(p.id));
          const allEnabled = selectedProductsData.every(p => p.sampleRequestsEnabled !== false);
          const allDisabled = selectedProductsData.every(p => p.sampleRequestsEnabled === false);
          
          return (
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 mb-6 flex items-center justify-between">
              <span className="text-blue-300 font-medium">
                {selectedProducts.size} product{selectedProducts.size > 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                {!allEnabled && (
                  <button
                    onClick={() => handleBulkToggle(true)}
                    disabled={updating.size > 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Power className="w-4 h-4" />
                    Enable All
                  </button>
                )}
                {!allDisabled && (
                  <button
                    onClick={() => handleBulkToggle(false)}
                    disabled={updating.size > 0}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <PowerOff className="w-4 h-4" />
                    Disable All
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-[#1a2332] border border-[#334155] p-12 text-center">
            <Package className="w-16 h-16 text-[#334155] mx-auto mb-4" />
            <p className="text-[#94a3b8] text-lg">No products found</p>
          </div>
        ) : (
          <>
            <div className="bg-[#1a2332] border border-[#334155] overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0f1623] border-b border-[#334155]">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedProducts.size === paginatedProducts.length &&
                            paginatedProducts.length > 0
                          }
                          onChange={selectAll}
                          className="w-4 h-4 rounded border-[#334155] bg-[#1a2332] cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {paginatedProducts.map((product) => {
                      const isEnabled = product.sampleRequestsEnabled !== false;
                      const isUpdating = updating.has(product.id);
                      const isSelected = selectedProducts.has(product.id);

                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-[#0f1623] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProduct(product.id)}
                              className="w-4 h-4 rounded border-[#334155] bg-[#1a2332] cursor-pointer"
                            />
                          </td>
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
                                  className="w-12 h-12 object-cover"
                                />
                              )}
                              <span className="text-[#f1f5f9] font-medium">
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#94a3b8]">
                            {product.category || "—"}
                          </td>
                          <td className="px-6 py-4 text-[#f1f5f9]">
                            {product.price ? `$${product.price}` : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                isEnabled
                                  ? "bg-green-900/30 text-green-400 border border-green-700"
                                  : "bg-red-900/30 text-red-400 border border-red-700"
                              }`}
                            >
                              {isEnabled ? "Enabled" : "Disabled"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleSingle(product.id, isEnabled)}
                              disabled={isUpdating}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0A0F1E] ${
                                isEnabled ? "bg-green-600" : "bg-gray-600"
                              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 text-white absolute left-1/2 -translate-x-1/2 animate-spin" />
                              ) : (
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    isEnabled ? "translate-x-6" : "translate-x-1"
                                  }`}
                                />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-[#1a2332] border border-[#334155] p-4">
                <div className="text-sm text-[#94a3b8]">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} results
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={!hasPrev}
                    className="px-3 py-1 border border-[#334155] text-[#94a3b8] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#334155]/50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-sm text-[#94a3b8]">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={!hasNext}
                    className="px-3 py-1 border border-[#334155] text-[#94a3b8] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#334155]/50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SampleRequestsToggleDashboard;