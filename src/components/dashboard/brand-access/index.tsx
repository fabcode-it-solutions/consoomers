/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback } from "react";
import { Eye, EyeOff, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";
import PageHeader from "../PageHeader";
import TableSkeleton from "@/components/ui/dashboard/TableSkeleton";
import EmptyTableUi from "@/components/ui/dashboard/EmptyTable";
import Pagination from "@/components/ui/dashboard/Pagination";
import { userService } from "@/services/users.service";
import { SerchField } from "@/components/ui/dashboard/Search";
import Dropdown from "@/components/ui/dashboard/DropDown";

interface Brand {
  id: string;
  username?: string;
  firstName?: string;
  email: string;
  brand?: {
    id?: string;
    brandName?: string;
    accessPassword?: string;
    website?: string;
    category?: string;
  };
}

const BrandAccessPage: React.FC = () => {
  const [state, setState] = useState<{
    brands: Brand[];
    searchTerm: string;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
    loading: boolean;
    saving: { [key: string]: boolean };
    showPasswords: { [key: string]: boolean };
    passwords: { [key: string]: string };
  }>({
    brands: [],
    searchTerm: "",
    currentPage: 1,
    itemsPerPage: 20,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
    loading: false,
    saving: {},
    showPasswords: {},
    passwords: {},
  });

  const {
    brands,
    searchTerm,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    hasNext,
    hasPrev,
    loading,
    saving,
    showPasswords,
    passwords,
  } = state;

  const loadBrands = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      let result;
      
      if (searchTerm.trim()) {
        // First, search by brand name
        result = await userService.getAllUsers({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          role: "brand",
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        
        // If no results found with brand name search, try email search
        if (result?.success && (!result.usersData || result.usersData.length === 0)) {
          result = await userService.getAllUsers({
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            role: "brand",
            sortBy: "createdAt",
            sortOrder: "desc",
          });
        }
      } else {
        // No search term, get all brands
        result = await userService.getAllUsers({
          page: currentPage,
          limit: itemsPerPage,
          role: "brand",
          sortBy: "createdAt",
          sortOrder: "desc",
        });
      }

      if (result?.success) {
        const brandsData = result.usersData || [];
        
        // Filter results based on search term priority
        let filteredBrands = brandsData;
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          
          // First priority: brands matching by brand name
          const brandNameMatches = brandsData.filter((brand: Brand) => 
            brand.brand?.brandName?.toLowerCase().includes(searchLower)
          );
          
          // Second priority: brands matching by email (only if no brand name matches)
          const emailMatches = brandNameMatches.length === 0 
            ? brandsData.filter((brand: Brand) => 
                brand.email?.toLowerCase().includes(searchLower)
              )
            : [];
          
          filteredBrands = brandNameMatches.length > 0 ? brandNameMatches : emailMatches;
        }
        
        const passwordsMap: { [key: string]: string } = {};

        filteredBrands.forEach((brand: Brand) => {
          const brandId = brand.brand?.id || brand.id;
          passwordsMap[brandId] = brand.brand?.accessPassword || "";
          console.log("Loading brand:", {
            brandName: brand.brand?.brandName,
            brandId: brand.brand?.id,
            userId: brand.id,
            hasPassword: !!brand.brand?.accessPassword,
          });
        });

        setState((prev) => ({
          ...prev,
          brands: filteredBrands,
          passwords: passwordsMap,
          totalPages: result.pagination.totalPages,
          currentPage: result.pagination.currentPage,
          totalItems: filteredBrands.length,
          hasNext: result.pagination.hasNext,
          hasPrev: result.pagination.hasPrev,
          loading: false,
        }));
      } else {
        setState((prev) => ({ ...prev, brands: [], loading: false }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch brands.");
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useDebounce(
    () => {
      loadBrands();
    },
    4000,
    [searchTerm]
  );

  React.useEffect(() => {
    loadBrands();
  }, [currentPage, itemsPerPage, loadBrands]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      searchTerm: e.target.value,
      currentPage: 1,
    }));
  };

  const handlePasswordChange = (brandId: string, password: string) => {
    setState((prev) => ({
      ...prev,
      passwords: { ...prev.passwords, [brandId]: password },
    }));
  };

  const togglePasswordVisibility = (brandId: string) => {
    setState((prev) => ({
      ...prev,
      showPasswords: {
        ...prev.showPasswords,
        [brandId]: !prev.showPasswords[brandId],
      },
    }));
  };

  const savePassword = async (inputId: string) => {
    const password = passwords[inputId]?.trim();

    console.log("Save password called with:", { inputId, password, passwords });

    if (!password) {
      toast.error("Access password is required for brand protection.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    // Find the actual brand from the brands array
    const brand = brands.find((b) => (b.brand?.id || b.id) === inputId);
    const actualBrandId = brand?.id; // Use the user ID as brand ID

    console.log("Found brand:", { brand, actualBrandId, inputId });

    if (!actualBrandId) {
      toast.error("Brand ID not found. Cannot save password.");
      return;
    }

    setState((prev) => ({
      ...prev,
      saving: { ...prev.saving, [inputId]: true },
    }));

    try {
      const payload = {
        brandId: actualBrandId,
        accessPassword: password,
      };

      console.log("Sending to API:", payload);

      const response = await fetch("/api/brand-access-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("API response:", { status: response.status, result });

      if (response.ok) {
        toast.success("Access password saved successfully!");
        setState((prev) => ({
          ...prev,
          brands: prev.brands.map((b) =>
            b.id === actualBrandId
              ? { ...b, brand: { ...b.brand!, accessPassword: password } }
              : b
          ),
        }));
      } else {
        toast.error(`Failed to save: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Save password error:", error);
      toast.error("Failed to save access password.");
    } finally {
      setState((prev) => ({
        ...prev,
        saving: { ...prev.saving, [inputId]: false },
      }));
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setState((prev) => ({
      ...prev,
      itemsPerPage: Number(value),
      currentPage: 1,
    }));
  };

  return (
    <div className="bg-dark-100">
      <div className="mx-auto p-4">
        <PageHeader
          heading="Brand Access Passwords"
          describe="Set mandatory unique passwords for each brand page. Testers must enter the correct password to access brand pages."
        />

        <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
          <div className="flex-1">
            {/* <SerchField
              name="brand_search_input"
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={handleSearch}
            /> */}
            <div className="relative w-full">
              <input
                type="text"
                name="fake_email"
                autoComplete="username"
                style={{ display: "none" }}
              />

              <input
                type="text"
                name="brand_search_input"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={handleSearch}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="w-full px-3 py-2 text-white  border border-[#334155]   focus:ring-1 focus:border-transparent  font-sofia-sans placeholder:text-[#f1f5f9]"
              />
            </div>
          </div>
          <div className="flex gap-2 max-mb-xl:hidden ">
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

        {loading && <TableSkeleton />}
        {!loading && (
          <div className="bg-dark-100 border border-[#334155] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-5/10 border-b border-[#334155]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Brand Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Owner Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Access Password
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-5/20">
                  {brands.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6">
                        <EmptyTableUi
                          heading="No brand requests found"
                          description="No brands available to manage access passwords."
                        />
                      </td>
                    </tr>
                  ) : (
                    brands.map((brand) => (
                      <tr
                        key={brand.id}
                        className="hover:bg-[#334155] border-[#334155]"
                      >
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          {brand.brand?.brandName || "-"}
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          {brand.email}
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          <div className="flex items-center gap-2">
                            <input
                              type={
                                showPasswords[brand.brand?.id || brand.id]
                                  ? "text"
                                  : "password"
                              }
                              value={
                                passwords[brand.brand?.id || brand.id] || ""
                              }
                              onChange={(e) =>
                                handlePasswordChange(
                                  brand.brand?.id || brand.id,
                                  e.target.value
                                )
                              }
                              placeholder="Enter unique access password (min 6 chars)"
                              className="bg-[#334155] border border-[#475569] rounded px-3 py-2 text-[#f1f5f9] text-sm focus:outline-none focus:border-blue-500 w-64"
                              required
                            />
                            <button
                              onClick={() =>
                                togglePasswordVisibility(
                                  brand.brand?.id || brand.id
                                )
                              }
                              className="p-2 hover:bg-gray-5/10 rounded"
                            >
                              {showPasswords[brand.brand?.id || brand.id] ? (
                                <EyeOff className="w-4 h-4 text-gray-4" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          {brand.brand?.accessPassword ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Protected
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                              Unprotected
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          <button
                            onClick={() =>
                              savePassword(brand.brand?.id || brand.id)
                            }
                            disabled={
                              saving[brand.brand?.id || brand.id] ||
                              !passwords[brand.brand?.id || brand.id]?.trim()
                            }
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-3 py-2 rounded text-sm disabled:cursor-not-allowed"
                          >
                            <Save className="w-4 h-4" />
                            {saving[brand.brand?.id || brand.id]
                              ? "Saving..."
                              : "Save"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

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
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandAccessPage;
