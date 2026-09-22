/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useCallback, useEffect } from "react";
import PageHeader from "../PageHeader";
import { SerchField } from "@/components/ui/dashboard/Search";
import {
  CheckCircle,
  XCircle,
  Package,
  Truck,
  Eye,
  MoreHorizontal,
  Calendar,
  Search,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import Pagination from "@/components/ui/dashboard/Pagination";
import DeleteConfirmationDialog from "@/components/ui/dashboard/ConfirmationPopup";
import DialogPopup from "@/components/ui/DialogPopup";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Loader";

interface SampleRequest {
  request: {
    id: string;
    status: "pending" | "approved" | "rejected" | "shipped" | "delivered";
    requestedAt: string;
    approvedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    trackingNumber?: string;
    notes?: string;
    adminNotes?: string;
    shippingAddress?: string;
  };
  product: {
    id: string;
    name: string;
    handle: string;
  };
  tester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-900/30 text-yellow-400 border border-yellow-700",
  },
  approved: {
    label: "Approved",
    color: "bg-green-900/30 text-green-400 border border-green-700",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-900/30 text-red-400 border border-red-700",
  },
  shipped: {
    label: "Shipped",
    color: "bg-blue-900/30 text-blue-400 border border-blue-700",
  },
  delivered: {
    label: "Delivered",
    color: "bg-purple-900/30 text-purple-400 border border-purple-700",
  },
};

const ITEMS_PER_PAGE = 20;

const AdminSampleRequests = () => {
  const [requests, setRequests] = useState<SampleRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SampleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<SampleRequest | null>(
    null
  );
  const [showShipModal, setShowShipModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteAction, setDeleteAction] = useState<"approve" | "reject" | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  // Fetch requests
  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/sample-request");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRequests(data.requests || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Debounce search
  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    },
    500,
    [searchTerm]
  );

  // Filter requests
  useEffect(() => {
    let filtered = requests;

    if (filterStatus !== "all") {
      filtered = filtered.filter((r) => r.request.status === filterStatus);
    }

    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.tester.email
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          r.product.name
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          r.tester.firstName
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          r.tester.lastName
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [requests, filterStatus, debouncedSearchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const updateRequestStatus = async (
    requestId: string,
    status: string,
    tracking?: string,
    notes?: string
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/dashboard/sample-request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          status,
          trackingNumber: tracking,
          adminNotes: notes,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      const data = await res.json();

      // Update local state with server response
      setRequests((prev) =>
        prev.map((r) =>
          r.request.id === requestId
            ? {
                ...r,
                request: {
                  ...r.request,
                  status: status as any,
                  trackingNumber: tracking,
                  adminNotes: notes,
                  // Update timestamps from server response
                  approvedAt:
                    data.updatedRequest?.approvedAt || r.request.approvedAt,
                  shippedAt:
                    data.updatedRequest?.shippedAt || r.request.shippedAt,
                  deliveredAt:
                    data.updatedRequest?.deliveredAt || r.request.deliveredAt,
                },
              }
            : r
        )
      );

      setShowShipModal(false);
      setShowDetailsModal(false);
      setSelectedRequest(null);
      setOpenDropdown(null);
      setDeleteConfirmId(null);
      setDeleteAction(null);

      // Reload to ensure sync with database
      setTimeout(() => loadRequests(), 500);
    } catch (error) {
      console.error("Error updating request:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickAction = (request: SampleRequest, action: string) => {
    if (action === "approve") {
      setDeleteConfirmId(request.request.id);
      setDeleteAction("approve");
    } else if (action === "reject") {
      setDeleteConfirmId(request.request.id);
      setDeleteAction("reject");
    } else if (action === "ship") {
      setSelectedRequest(request);
      setTrackingNumber(request.request.trackingNumber || "");
      setAdminNotes(request.request.adminNotes || "");
      setShowShipModal(true);
    }
  };

  const confirmAction = () => {
    if (!deleteConfirmId || !deleteAction) return;

    const request = requests.find((r) => r.request.id === deleteConfirmId);
    if (!request) return;

    // Map action to correct status value
    const statusValue = deleteAction === "approve" ? "approved" : "rejected";
    updateRequestStatus(deleteConfirmId, statusValue);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full">
        <Spinner className="w-12 h-12 mt-10" />
      </div>

      // <div className="p-6 bg-[#1a2332] min-h-screen">
      //   <div className="animate-pulse space-y-4">
      //     {[1, 2, 3].map((i) => (
      //       <div key={i} className="h-20 bg-slate-700 rounded-lg"></div>
      //     ))}
      //   </div>
      // </div>
    );
  }

  return (
    // <div className=" min-h-screen">
    //   <div className="max-w-7xl mx-auto">
    //     {/* Header */}
    //     <div className="mb-8">
    //       <h1 className="text-3xl font-bold text-slate-100 mb-2">
    //         Sample Requests
    //       </h1>
    //       <p className="text-slate-400">
    //         Manage and approve product sample requests from testers
    //       </p>
    //     </div>
    <div className="bg-dark-100">
      <div className="mx-auto p-4">
        <PageHeader
          heading="Sample Requests"
          describe="Manage and approve product sample requests from testers"
        />

        {/* Controls */}
        {/* <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative"> */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
          <div className="flex-1">
            <SerchField
              name="search"
              type="text"
              placeholder="Search by tester name, email, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by tester name, email, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            /> */}
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 overflow-hidden">
          {paginatedRequests.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No sample requests found</p>
            </div>
          ) : (
            // <div className="overflow-x-auto">
            //   <table className="w-full">
            //     <thead className="bg-slate-900 border-b border-slate-700">
            //       <tr>
            //         <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
            <div className="overflow-x-auto max-tab-lg:hidden">
              <table className="w-full">
                <thead className="bg-gray-5/10 border-b border-[#334155]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Tester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Tracking
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {paginatedRequests.map((item) => {
                    const status = statusConfig[
                      item.request.status as keyof typeof statusConfig
                    ] || {
                      label: item.request.status || "Unknown",
                      color:
                        "bg-gray-900/30 text-gray-400 border border-gray-700",
                    };
                    const canApprove = item.request.status === "pending";
                    const canShip = item.request.status === "approved";
                    const canDeliver = item.request.status === "shipped";

                    return (
                      <tr
                        key={item.request.id}
                        className="hover:bg-slate-700/50 transition"
                      >
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-slate-100">
                            {item.tester.firstName} {item.tester.lastName}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.tester.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-100">
                          {item.product.name}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-gray-4" />
                            {formatDate(item.request.requestedAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {item.request.trackingNumber || "—"}
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === item.request.id
                                  ? null
                                  : item.request.id
                              )
                            }
                            className="p-2 hover:bg-gray-5/10"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-4" />
                          </button>

                          {openDropdown === item.request.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                              {canApprove && (
                                <>
                                  <button
                                    onClick={() => {
                                      handleQuickAction(item, "approve");
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-green-900/20 text-green-400 flex items-center gap-2 border-b border-slate-700"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleQuickAction(item, "reject");
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-900/20 text-red-400 flex items-center gap-2 border-b border-slate-700"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </button>
                                </>
                              )}

                              {canShip && (
                                <button
                                  onClick={() => {
                                    handleQuickAction(item, "ship");
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-blue-900/20 text-blue-400 flex items-center gap-2 border-b border-slate-700"
                                >
                                  <Truck className="w-4 h-4" />
                                  Ship
                                </button>
                              )}

                              {canDeliver && (
                                <button
                                  onClick={() => {
                                    updateRequestStatus(
                                      item.request.id,
                                      "delivered"
                                    );
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-purple-900/20 text-purple-400 flex items-center gap-2 border-b border-slate-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Deliver
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedRequest(item);
                                  setShowDetailsModal(true);
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700 text-slate-300 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            totalItems={filteredRequests.length}
            itemsPerPage={ITEMS_PER_PAGE}
            hasPrev={hasPrev}
            hasNext={hasNext}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>

      {/* Delete/Confirm Dialog */}
      <DeleteConfirmationDialog
        deleteBrandId={deleteConfirmId ? 1 : null}
        setDeleteBrandId={(id) =>
          setDeleteConfirmId(id ? deleteConfirmId : null)
        }
        confirmDelete={confirmAction}
        deleteLoading={actionLoading}
        heading={`${
          deleteAction === "approve" ? "Approve" : "Reject"
        } Request?`}
        content={`Are you sure you want to ${
          deleteAction === "approve" ? "approve" : "reject"
        } this sample request?`}
        actionLabel={deleteAction === "approve" ? "Approve" : "Reject"}
        mode="dark"
      />

      {/* Ship Modal */}
      <DialogPopup
        open={showShipModal}
        setShowCreateModal={setShowShipModal}
        heading="Ship Sample Request"
        mode="dark"
        className="bg-slate-800 border-slate-700"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tracking Number
            </label>
            {/* <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            /> */}

            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => {
                setTrackingNumber(e.target.value);

                if (trackingError) {
                  setTrackingError("");
                }
              }}
              placeholder="Enter tracking number"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {trackingError && (
              <p className="text-red-500 text-sm mt-1">{trackingError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes about this shipment"
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 mt-6 justify-end">
            <Button
              onClick={() => setShowShipModal(false)}
              // className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition"
              className="text-white bg-transparent border"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!trackingNumber.trim()) {
                  setTrackingError(
                    "Please fill the Tracking Number for Shipment"
                  );
                  return;
                }

                setTrackingError("");

                if (selectedRequest) {
                  updateRequestStatus(
                    selectedRequest.request.id,
                    "shipped",
                    trackingNumber,
                    adminNotes
                  );
                }
              }}
              className="text-white"
            >
              {actionLoading ? "Shipping..." : "Ship Request"}
            </Button>

            {/* <Button
              onClick={() =>
                selectedRequest &&
                updateRequestStatus(
                  selectedRequest.request.id,
                  "shipped",
                  trackingNumber,
                  adminNotes
                )
              }
              // disabled={actionLoading}
              className="text-white border"
            >
              {actionLoading ? "Shipping..." : "Ship Request"}
            </Button> */}
          </div>
        </div>
      </DialogPopup>

      {/* Details Modal */}
      <DialogPopup
        open={showDetailsModal}
        setShowCreateModal={setShowDetailsModal}
        heading="Request Details"
        mode="dark"
        className="bg-slate-800 border-slate-700"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Tester Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Tester Information
              </h3>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg space-y-2">
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Name:</span>
                  <span className="text-slate-400 ml-2">
                    {selectedRequest.tester.firstName}{" "}
                    {selectedRequest.tester.lastName}
                  </span>
                </p>
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Email:</span>
                  <span className="text-slate-400 ml-2">
                    {selectedRequest.tester.email}
                  </span>
                </p>
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Product Information
              </h3>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Product:</span>
                  <span className="text-slate-400 ml-2">
                    {selectedRequest.product.name}
                  </span>
                </p>
              </div>
            </div>

            {/* Request Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Request Timeline
              </h3>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-400"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-300">
                      Requested
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(selectedRequest.request.requestedAt)}
                    </p>
                  </div>
                </div>

                {selectedRequest.request.approvedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-green-400"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-300">
                        Approved
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(selectedRequest.request.approvedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {selectedRequest.request.shippedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-300">
                        Shipped
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(selectedRequest.request.shippedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {selectedRequest.request.deliveredAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-400"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-300">
                        Delivered
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(selectedRequest.request.deliveredAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Additional Information
              </h3>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg space-y-2">
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Status:</span>
                  <span className="ml-2">
                    {
                      (
                        statusConfig[
                          selectedRequest.request
                            .status as keyof typeof statusConfig
                        ] || {
                          label: selectedRequest.request.status || "Unknown",
                          color:
                            "bg-gray-900/30 text-gray-400 border border-gray-700",
                        }
                      ).label
                    }
                  </span>
                </p>

                {selectedRequest.request.shippingAddress && (
                  <p className="text-sm text-slate-300">
                    <span className="font-medium">Shipping Address:</span>
                    <span className="text-slate-400 ml-2 block mt-1">
                      {selectedRequest.request.shippingAddress}
                    </span>
                  </p>
                )}

                {selectedRequest.request.notes && (
                  <p className="text-sm text-slate-300">
                    <span className="font-medium">Tester Notes:</span>
                    <span className="text-slate-400 ml-2 block mt-1">
                      {selectedRequest.request.notes}
                    </span>
                  </p>
                )}

                {selectedRequest.request.trackingNumber && (
                  <p className="text-sm text-slate-300">
                    <span className="font-medium">Tracking Number:</span>
                    <span className="text-slate-400 ml-2">
                      {selectedRequest.request.trackingNumber}
                    </span>
                  </p>
                )}

                {selectedRequest.request.adminNotes && (
                  <p className="text-sm text-slate-300">
                    <span className="font-medium">Admin Notes:</span>
                    <span className="text-slate-400 ml-2 block mt-1">
                      {selectedRequest.request.adminNotes}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogPopup>
    </div>
  );
};

export default AdminSampleRequests;
