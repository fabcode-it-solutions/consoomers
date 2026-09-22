import * as AlertDialog from "@radix-ui/react-alert-dialog";
import React from "react";

type T = {
  deleteBrandId?: number | null;
  actionLabel?: string;
  setDeleteBrandId?: (v: number | null) => void;
  confirmDelete?: () => void;
  deleteLoading?: boolean;
  heading: string;
  content: string;
  mode?: "light" | "dark"; // <-- added
};

const DeleteConfirmationDialog = ({
  deleteBrandId,
  setDeleteBrandId,
  confirmDelete,
  deleteLoading,
  heading,
  content,
  actionLabel = "Delete",
  mode = "light", 
}: T) => {

  const isDark = mode === "dark";

  const containerClass = isDark
    ? "bg-dark-100 border border-gray-700 text-white"
    : "bg-white border border-gray-300 text-black";

  const titleClass = isDark
    ? "text-light-100"
    : "text-gray-900";

  const descClass = isDark
    ? "text-gray-300"
    : "text-gray-600";

  const cancelClass = isDark
    ? "border border-gray-600 text-white hover:bg-gray-700"
    : "border border-gray-300 text-black hover:bg-gray-100";

  return (
    <>
      <AlertDialog.Root open={deleteBrandId !== null}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50" />
          <AlertDialog.Content
            className={`fixed top-1/2 left-1/2 transform 
              -translate-x-1/2 -translate-y-1/2  p-6 
              w-full max-w-md z-50 ${containerClass}`}
          >
            <AlertDialog.Title
              className={`text-lg font-semibold mb-4 font-audiowide ${titleClass}`}
            >
              {heading}
            </AlertDialog.Title>

            <AlertDialog.Description
              className={`mb-6 font-sofia-sans ${descClass}`}
            >
              {content}
            </AlertDialog.Description>

            <div className="flex gap-3 justify-end">
              <AlertDialog.Cancel asChild>
                <button
                  className={`px-4 py-2  font-sofia-sans ${cancelClass}`}
                  onClick={() =>
                    setDeleteBrandId ? setDeleteBrandId(null) : ""
                  }
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>

              <AlertDialog.Action asChild>
                <button
                  className="px-4 py-2 bg-red-600 text-white  hover:bg-red-700 disabled:opacity-50 font-sofia-sans"
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? `${actionLabel}...` : actionLabel}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
};

export default DeleteConfirmationDialog;
