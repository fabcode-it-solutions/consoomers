import * as AlertDialog from "@radix-ui/react-alert-dialog";
import React from "react";
type T = {
  deleteId?: string;
  actionLabel?: string;
  setDelete?: (v: string) => void;
  confirmDelete?: () => void;
  deleteLoading?: boolean;
  heading: string;
  content: string;
};
const DeleteConfirmationDialog = ({
  deleteId,
  setDelete,
  confirmDelete,
  deleteLoading,
  heading,
  content,
  actionLabel = "Delete",
}: T) => {
  return (
    <>
      <AlertDialog.Root open={deleteId !== null}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-100  p-6 w-full max-w-md z-50">
            <AlertDialog.Title className="text-lg font-semibold mb-4 text-light-100 font-audiowide">
              {heading}
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-4 mb-6 font-sofia-sans">
              {content}
            </AlertDialog.Description>
            <div className="flex gap-3 justify-end">
              <AlertDialog.Cancel asChild>
                <button
                  className="px-4 py-2 border border-gray-5/20 rounded text-light-100 hover:bg-gray-5/10 font-sofia-sans"
                  onClick={() => (setDelete ? setDelete("") : "")}
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-sofia-sans"
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
