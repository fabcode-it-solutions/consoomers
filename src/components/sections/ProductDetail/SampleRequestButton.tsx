/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import DialogPopup from "@/components/ui/DialogPopup";

interface RequestSampleButtonProps {
  productId: string;
  productName: string;
}

const RequestSampleButton: React.FC<RequestSampleButtonProps> = ({
  productId,
  productName,
}) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [shippingError, setShippingError] = useState("");

  useEffect(() => {
    checkIfRequested();
  }, [productId, session]);

  const checkIfRequested = async () => {
    if (!session?.user) {
      setCheckingStatus(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/dashboard/sample-request?productId=${productId}`
      );
      const data = await res.json();
      setHasRequested(data.requests?.length > 0);
    } catch (error) {
      console.error("Failed to check request status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleRequestSample = async () => {
    if (!session?.user) {
      toast.error("Please sign in to request a sample");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/dashboard/sample-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          notes,
          shippingAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to request sample");
      }

      setHasRequested(true);
      setShowModal(false);
      setNotes("");
      setShippingAddress("");
      toast.success(
        data.message ||
          "Sample requested send successfull send to brand admin 🎉"
      );
    } catch (error: any) {
      console.error("Request sample error:", error);
      toast.error(error.message || "Failed to request sample");
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-600  font-semibold cursor-not-allowed"
      >
        <span>⏳</span>
        <span>Loading...</span>
      </button>
    );
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => toast.error("Please sign in to request a sample")}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white  font-semibold hover:from-purple-600 hover:to-pink-600 transition"
      >
        <span>Request Free Sample</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          if (hasRequested) {
            toast("You've already requested this sample", { icon: "ℹ️" });
          } else {
            setShowModal(true);
          }
        }}
        disabled={hasRequested}
        className={`flex items-center gap-2 px-4 w-full justify-center py-2  font-semibold transition ${
          hasRequested
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-blue-500 text-white"
        }`}
      >
        <span>{hasRequested ? "Sample Requested" : "Request Free Sample"}</span>
      </button>
      <DialogPopup
        heading="Request Sample"
        open={showModal}
        setShowCreateModal={setShowModal}
        mode="light"
        className=" shadow-lg"
      >
        <div className="space-y-4 p-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product
            </label>
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <p className="font-semibold text-gray-800">{productName}</p>
            </div>
          </div>
          <div>
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
              Shipping Address
              <span className="text-red-500 pl-1">*</span>
            </label>
            <textarea
              value={shippingAddress}
              onChange={(e) => {
                setShippingAddress(e.target.value);

                if (shippingError) {
                  setShippingError("");
                }
              }}
              placeholder="Enter your shipping address..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 
  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {shippingError && (
              <p className="text-red-500 text-sm mt-1">{shippingError}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why do you want to try this product? (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell us why you're interested..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 
              text-gray-700 hover:bg-gray-50 font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!shippingAddress.trim()) {
                  setShippingError("Please provide the Shipping Address");
                  return;
                }

                setShippingError("");
                handleRequestSample();
              }}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white 
               font-semibold transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      </DialogPopup>
    </>
  );
};

export default RequestSampleButton;
