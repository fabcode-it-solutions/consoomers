/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useCallback } from "react";
import { Calendar, Eye, MoreHorizontal } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useDebounce } from "@/hooks/useDebounce";
import PageHeader from "../PageHeader";
import { SerchField } from "@/components/ui/dashboard/Search";
import Dropdown from "@/components/ui/dashboard/DropDown";
import TableSkeleton from "@/components/ui/dashboard/TableSkeleton";
import EmptyTableUi from "@/components/ui/dashboard/EmptyTable";
import Pagination from "@/components/ui/dashboard/Pagination";
import { formatDate } from "@/utils/default";
import { BrandService } from "@/services/brand.service";

interface BrandRequest {
  id: string;
  brandName: string;
  userName: string;
  status: string;
  createdAt: string;
  brandId: string;
}

const BrandRequestsPage: React.FC = () => {
  const [state, setState] = useState<{
    brandRequests: BrandRequest[];
    searchTerm: string;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
    loading: boolean;
  }>({
    brandRequests: [],
    searchTerm: "",
    currentPage: 1,
    itemsPerPage: 20,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
    loading: false,
  });

  const {
    brandRequests,
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
  const handleViewDetails = (brandId: string) => {
    router.push(`/dashboard/brand-request/${brandId}`);
  };
  const loadBrandRequests = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const result = await BrandService.getAllBrandRequests({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sortBy: "createdAt",
        sortOrder: "desc",
      } as any);

      console.log(result, "result");

      if (result?.success) {
        setState((prev) => ({
          ...prev,
          brandRequests: result.data || [],
          totalPages: result.pagination?.totalPages || 1,
          currentPage: result.pagination?.currentPage || 1,
          totalItems: result.pagination?.totalItems || 0,
          hasNext: result.pagination?.hasNext || false,
          hasPrev: result.pagination?.hasPrev || false,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          brandRequests: [],
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching brand requests:", error);
      setState((prev) => ({ ...prev, loading: false }));
      toast.error("Failed to fetch brand requests");
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useDebounce(loadBrandRequests, 400, [searchTerm, currentPage, itemsPerPage]);

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

  return (
    <div className="bg-dark-100">
      <div className="mx-auto p-4">
        <PageHeader
          heading="Brand Requests"
          describe="Manage and review all submitted brand requests"
        />

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
          <div className="flex-1">
            <SerchField
              name="search"
              type="text"
              placeholder="Search brands..."
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
            <div className="overflow-x-auto max-tab-lg:hidden">
              <table className="w-full">
                <thead className="bg-gray-5/10 border-b border-[#334155]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Brand Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      User Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-5/20">
                  {brandRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6">
                        <EmptyTableUi
                          heading="No brand requests found"
                          description="Try adjusting your search or filter."
                        />
                      </td>
                    </tr>
                  ) : (
                    brandRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-[#334155] border-[#334155]"
                      >
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans capitalize">
                          {req.brandName}
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans capitalize">
                          {req.userName}
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans capitalize">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              req.status === "approved"
                                ? "bg-green-600/20 text-green-400"
                                : req.status === "rejected"
                                ? "bg-red-600/20 text-red-400"
                                : "bg-yellow-600/20 text-yellow-400"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans flex gap-2 items-center">
                          <Calendar className="w-3 h-3 text-gray-4" />
                          {req.createdAt ? formatDate(req.createdAt) : "N/A"}
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
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-[#f1f5f9] font-sofia-sans"
                                  onClick={() => handleViewDetails(req.brandId)}
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
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

            {/* Responsive Cards */}
            <div className="max-tab-lg:block hidden space-y-4">
              {brandRequests.length === 0 ? (
                <table>
                  <tbody>
                    <tr>
                      <td colSpan={7} className="py-6">
                        <EmptyTableUi
                          heading="No brand requests found"
                          description="Try adjusting your search."
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                brandRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-dark-200 border border-[#334155] p-4 shadow-sm"
                  >
                    <div className="text-sm font-medium text-[#f1f5f9] font-sofia-sans">
                      {req.brandName}
                    </div>
                    <div className="text-xs text-[#f1f5f9] font-sofia-sans">
                      {req.userName}
                    </div>
                    <div className="text-xs text-[#f1f5f9] font-sofia-sans">
                      Status: {req.status}
                    </div>
                    <div className="text-xs text-[#f1f5f9] font-sofia-sans">
                      Created:{" "}
                      {req.createdAt ? formatDate(req.createdAt) : "N/A"}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
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

export default BrandRequestsPage;
