import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@sglara/cn";
import { X } from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/utils/useIsMobile";
import BottomDrawer from "./BottomDrawer";

const DialogPopup = ({
  className,
  heading,
  children,
  open,
  setShowCreateModal,
  overlayStyle,
  mode,
}: {
  className?: string;
  heading: string;
  children: React.ReactNode;
  open: boolean;
  setShowCreateModal: (open: boolean) => void;
  overlayStyle?: string;
  mode?: string;
}) => {
  const isMobile = useIsMobile();

  return isMobile ? (
    <BottomDrawer
      heading={heading}
      onClose={() => setShowCreateModal(false)}
      open={open}
      type={mode == "light" ? "main" : "dashboard"}
    >
      <div className="pb-4">{children}</div>
    </BottomDrawer>
  ) : (
    <Dialog.Root open={open} modal={true} onOpenChange={setShowCreateModal}>
      <Dialog.Portal>
        {/* Animated Overlay */}
        <AnimatePresence>
          {open && (
            <motion.div
              className={cn(
                overlayStyle,
                "fixed inset-0 bg-black/50 backdrop-blur-xl z-50"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Animated Content */}
        <AnimatePresence>
          {open && (
            <Dialog.Content aria-describedby="content" asChild>
              <motion.div
                className={`fixed max-w-[750px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-gray-300 p-6 w-full z-50 max-h-[90vh] scrollbar-hide overflow-y-auto ${
                  mode == "light" ? "bg-white" : "bg-black/15"
                } ${className || ""}`}
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    className={`text-xl font-semibold font-audiowide ${
                      mode == "light" ? "text-dark-blue-cm" : "text-white"
                    }`}
                  >
                    {heading}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="p-2 hover:bg-gray-5/10 rounded-full">
                      <X className="w-4 h-4 text-black" />
                    </button>
                  </Dialog.Close>
                </div>
                <div>{children}</div>
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DialogPopup;
