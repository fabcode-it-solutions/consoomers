/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useCallback } from "react";

import { BlocksIcon, Calendar, Eye, MoreHorizontal, User2, UserX } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import toast from "react-hot-toast";

import { useRouter } from "next/navigation";
import { User } from "@/db/type";
import { userService } from "@/services/users.service";
import { useDebounce } from "@/hooks/useDebounce";
import PageHeader from "../PageHeader";
import { SerchField } from "@/components/ui/dashboard/Search";
import Dropdown from "@/components/ui/dashboard/DropDown";
import TableSkeleton from "@/components/ui/dashboard/TableSkeleton";
import EmptyTableUi from "@/components/ui/dashboard/EmptyTable";
import Pagination from "@/components/ui/dashboard/Pagination";
import { formatDate } from "@/utils/default";
const UsersPage: React.FC = () => {
  const [state, setState] = useState<{
    users: User[];
    searchTerm: string;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
    loading: boolean;
  }>({
    users: [],
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
    users,
    searchTerm,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    hasNext,
    hasPrev,
    loading,
  } = state;

  const loadUsers = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const result = await userService.getAllUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      console.log(result, "result");
      if (result?.success) {
        setState((prev) => ({
          ...prev,
          users: result.usersData || [],
          totalPages: result.pagination.totalPages,
          currentPage: result.pagination.currentPage,
          totalItems: result.pagination.totalItems,
          hasNext: result.pagination.hasNext,
          hasPrev: result.pagination.hasPrev,
          loading: false,
        }));
      } else {
        setState((prev) => ({ ...prev, users: [], loading: false }));
      }
    } catch (err) {
      console.error(err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useDebounce(loadUsers, 400, [searchTerm, currentPage, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      searchTerm: e.target.value,
      currentPage: 1,
    }));
  };

  const handleDeactivate = async (id: string) => {
    try {
      const res = await fetch(`/api/account/deactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        loadUsers();
      } else {
        toast.error(data.error || data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleActivate = async (email: string) => {
    try {
      const res = await fetch(`/api/account/reactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        loadUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setState((prev) => ({
      ...prev,
      itemsPerPage: Number(value),
      currentPage: 1,
    }));
  };
  const router = useRouter();
  return (
    <div className="bg-dark-100">
      <div className="mx-auto p-4">
        <PageHeader heading="Users" describe="See all your users" />
        <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
          <div className="flex-1">
            <SerchField
              name="search"
              type="text"
              placeholder="Search users..."
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

        {loading && <TableSkeleton />}

        {!loading && (
          <div className="bg-dark-100 border border-[#334155]  overflow-hidden">
            <div className="overflow-x-auto max-tab-lg:hidden">
              <table className="w-full">
                <thead className="bg-gray-5/10 border-b border-[#334155]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Role
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
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6">
                        <EmptyTableUi
                          heading="No users found"
                          description="Try adjusting your search or add a new user."
                        />
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-[#334155] border-[#334155]"
                      >
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans capitalize">
                          {user.username || user.firstName}
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              user.status === "active"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans capitalize">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans flex gap-2 items-center">
                          <Calendar className="w-3 h-3 text-gray-4" />
                          {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans ">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="p-2 hover:bg-gray-5/10 ">
                                <MoreHorizontal className="w-4 h-4 text-gray-4" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content
                                className="bg-dark-100 border border-[#334155]  shadow-lg p-1 z-50"
                                align="end"
                              >
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-[#f1f5f9] font-sofia-sans"
                                  onClick={() =>
                                    router.push(`/profile/${user.id}`)
                                  }
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </DropdownMenu.Item>
                                {user.status === "active" ? (
                                  <DropdownMenu.Item
                                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-red-400 font-sofia-sans"
                                    onClick={() => handleDeactivate(user.id)}
                                  >
                                  <UserX className="w-4 h-4"/>  Deactivate
                                  </DropdownMenu.Item>
                                ) : (
                                  <DropdownMenu.Item
                                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-green-400 font-sofia-sans"
                                    onClick={() => handleActivate(user.email)}
                                  >
                                   <User2 className="w-4 h-4"/> Activate
                                  </DropdownMenu.Item>
                                )}
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

            <div className="max-tab-lg:block hidden space-y-4">
              {users.length === 0 ? (
                <table>
                  <tbody>
                    <tr>
                      <td colSpan={7} className="py-6">
                        <EmptyTableUi
                          heading="No users found"
                          description="Try adjusting your search or add a new user."
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-dark-200 border border-[#334155]  p-4 shadow-sm"
                  >
                    <div className="text-sm font-medium text-[#f1f5f9] font-sofia-sans">
                      {user.username || user.firstName}
                    </div>
                    <div className="text-xs text-[#f1f5f9] font-sofia-sans">
                      {user.email}
                    </div>
                    <div className="text-xs text-[#f1f5f9] font-sofia-sans">
                      {user.status}
                    </div>
                    <div className="text-xs text-[#f1f5f9] font-sofia-sans">
                      {user.role}
                    </div>
                    <div className="text-xs text-[#f1f5f9] font-sofia-sans"></div>
                  </div>
                ))
              )}
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

export default UsersPage;
