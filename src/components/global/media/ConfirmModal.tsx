"use client";
import React from "react";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  description = "Are you sure you want to delete this item?"
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[99]">

      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{description}</p>

        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white"
          >
            No
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Yes, Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
