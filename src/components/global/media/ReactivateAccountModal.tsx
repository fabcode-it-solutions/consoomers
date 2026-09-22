"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/DialogModel";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Heading from "@/components/ui/Heading";

interface ReactivateAccountModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
}

export default function ReactivateAccountModal({
  open,
  onClose,
  email,
}: ReactivateAccountModalProps) {
  const [loading, setLoading] = useState(false);

  const handleReactivate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/account/reactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Welcome Back ! Your account has been reactivated!");
        onClose(); // close modal
      } else {
        toast.error(data.message || "Failed to reactivate.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-6 space-y-5 max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Heading level={2} className="text-xl font-semibold text-red-600">
              Account Deactivated
            </Heading>
          </DialogTitle>
        </DialogHeader>

        <p className="text-lg text-red-500">
          Your account has been deactivated. If you want to reactivate it, click
          the <span className="font-semibold">Reactivate</span> button below.
        </p>

        <div className="flex justify-end gap-3 pt-3">
          <Button className="bg-[#ffd400]" onClick={onClose}>
            Cancel
          </Button>

          <Button
            className="text-white"
            onClick={handleReactivate}
          >
            {loading ? "Reactivating..." : "Reactivate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
