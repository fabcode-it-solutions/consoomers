/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useCallback } from "react";
import { Calendar, Eye, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useDebounce } from "@/hooks/useDebounce";
import PageHeader from "../PageHeader";
import { SerchField } from "@/components/ui/dashboard/Search";
import Dropdown from "@/components/ui/dashboard/DropDown";
import TableSkeleton from "@/components/ui/dashboard/TableSkeleton";
import EmptyTableUi from "@/components/ui/dashboard/EmptyTable";
import Pagination from "@/components/ui/dashboard/Pagination";
import DeleteConfirmationDialog from "@/components/ui/dashboard/ConfirmationPopup";
import { formatDate } from "@/utils/default";

interface Product {
  id: string;
  name: string;
  handle: string;
  category?: string;
  price: string;
  brandId: string;
  brandName?:string;
  brandData?: {
    id: string;
    name: string;
    brandName: string;
  };
  createdAt: string;
  updatedAt: string;
  media?: string[];
}

const ProductDashboard: React.FC = () => {
  const [state, setState] = useState<{
    products: Product[];
    searchTerm: string;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
    loading: boolean;
  }>({
    products: [],
    searchTerm: "",
    currentPage: 1,
    itemsPerPage: 20,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
    loading: false,
  });

  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    products,
    searchTerm,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    hasNext,
    hasPrev,
    loading,
  } = state;

  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin" || (session?.user as any)?.isAdmin === true;

  const loadProducts = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        search: searchTerm,
        all: "true",
      });

      if (!isAdmin) params.append("userOwned", "true");

      const response = await fetch(`/api/product/get-product?${params.toString()}`);
      const result = await response.json();

      console.log("Result → ", result);

      if (result.products) {
        setState(prev => ({
          ...prev,
          products: result.products ?? [],
          totalPages: result.pagination?.totalPages ?? 1,
          currentPage: result.pagination?.currentPage ?? 1,
          totalItems: result.pagination?.total ?? 0,
          hasNext: result.pagination?.hasNext ?? false,
          hasPrev: result.pagination?.hasPrev ?? false,
          loading: false,
        }));
      } else {
        setState(prev => ({ ...prev, products: [], loading: false }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [currentPage, itemsPerPage, searchTerm, isAdmin]);

  useDebounce(loadProducts, 400, [searchTerm, currentPage, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      searchTerm: e.target.value,
      currentPage: 1,
    }));
  };

  const handleItemsPerPageChange = (value: string) => {
    setState((prev) => ({
      ...prev,
      itemsPerPage: Number(value),
      currentPage: 1,
    }));
  };

  // UPDATED: Now uses handle instead of id
  const handleEditProduct = (productHandle: string) => {
    router.push(`/dashboard/products/edit/${productHandle}`);
  };

  const handleViewProduct = (productHandle: string) => {
    router.push(`/products/${productHandle}`);
  };

  const handleDeleteClick = (productId: string) => {
    setDeleteProductId(productId);
  };

  const confirmDelete = async () => {
    if (!deleteProductId) return;

    setDeleteLoading(true);

    try {
      const response = await fetch(`/api/product/create-product`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: deleteProductId }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Product deleted successfully");
        loadProducts();
      } else {
        toast.error(result.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeleteLoading(false);
      setDeleteProductId(null);
    }
  };

  return (
    <div className="bg-dark-100">
      <div className="mx-auto p-4">
        <PageHeader
          heading={isAdmin ? "All Products" : "My Products"}
          describe={
            isAdmin
              ? "Manage all products across brands"
              : "Manage your brand's products"
          }
        />

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
          <div className="flex-1">
            <SerchField
              name="search"
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="flex gap-2 max-mb-xl:hidden">
            <Dropdown
              options={[
                { value: "10", label: "10 per page" },
                { value: "25", label: "25 per page" },
                { value: "50", label: "50 per page" },
                { value: "100", label: "100 per page" },
              ]}
              onValueChange={handleItemsPerPageChange}
              placeholder="Items per page"
            />
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && <TableSkeleton />}

        {!loading && (
          <div className="bg-dark-100 border border-[#334155] overflow-hidden">
            {/* Desktop Table */}
            <div className="overflow-x-auto max-tab-lg:hidden">
              <table className="w-full">
                <thead className="bg-gray-5/10 border-b border-[#334155]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Product
                    </th>
                    {/* {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                        Brand
                      </th>
                    )} */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-5/20">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="py-6">
                        <EmptyTableUi
                          heading="No products found"
                          description="Try adjusting your search or create a new product."
                        />
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-[#334155] border-[#334155]"
                      >
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          <div className="flex items-center gap-3">
                            {product.media && product.media[0] && (
                              <img
                                src={product.media[0]}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        {/* {isAdmin && (
                          <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                            {product.brandData?.brandName|| "-"}
                          </td>
                        )} */}
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          {product.category || "-"}
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          ${product.price}
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans flex gap-2 items-center">
                          <Calendar className="w-3 h-3 text-gray-4" />
                          {formatDate(product.updatedAt)}
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="p-2 hover:bg-gray-5/10">
                                <MoreHorizontal className="w-4 h-4 text-gray-4" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content
                                className="bg-dark-100 border border-[#334155] shadow-lg p-1 z-50"
                                align="end"
                              >
                                {/* UPDATED: Now passes product.handle */}
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-[#f1f5f9] font-sofia-sans"
                                  onClick={() => handleEditProduct(product.handle)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Edit Product
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-[#f1f5f9] font-sofia-sans"
                                  onClick={() => handleViewProduct(product.handle)}
                                >
                                  <Eye className="w-4 h-4" />
                                  View Product
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-500/10 rounded cursor-pointer text-red-400 font-sofia-sans"
                                  onClick={() => handleDeleteClick(product.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="max-tab-lg:block hidden space-y-4 p-4">
              {products.length === 0 ? (
                <EmptyTableUi
                  heading="No products found"
                  description="Try adjusting your search."
                />
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-dark-200 border border-[#334155] p-4 shadow-sm rounded"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {product.media && product.media[0] && (
                        <img
                          src={product.media[0]}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#f1f5f9] font-sofia-sans mb-1">
                          {product.name}
                        </div>
                        {isAdmin && (
                          <div className="text-xs text-[#94a3b8] font-sofia-sans">
                            Brand: {product.brandData?.name || "-"}
                          </div>
                        )}
                        <div className="text-xs text-[#94a3b8] font-sofia-sans">
                          Category: {product.category || "-"}
                        </div>
                        <div className="text-xs text-[#f1f5f9] font-sofia-sans mt-1">
                          Price: ${product.price}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-[#334155]">
                      {/* UPDATED: Now passes product.handle */}
                      <button
                        onClick={() => handleEditProduct(product.handle)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewProduct(product.handle)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#334155] hover:bg-[#334155] text-[#f1f5f9] text-sm rounded transition"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {products.length > 0 && (
              <Pagination
                currentPage={currentPage}
                hasNext={hasNext}
                hasPrev={hasPrev}
                itemsPerPage={itemsPerPage}
                setCurrentPage={(page: any) =>
                  setState((prev) => ({ ...prev, currentPage: page }))
                }
                totalItems={totalItems}
                totalPages={totalPages}
              />
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        deleteBrandId={deleteProductId ? 1 : null}
        mode="dark"
        setDeleteBrandId={() => setDeleteProductId(null)}
        confirmDelete={confirmDelete}
        deleteLoading={deleteLoading}
        heading="Delete Product"
        content="Are you sure you want to delete this product? This action cannot be undone."
        actionLabel="Delete"
      />
    </div>
  );
};

export default ProductDashboard;