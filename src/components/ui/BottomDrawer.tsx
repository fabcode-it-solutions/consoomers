import { cn } from "@sglara/cn";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect } from "react";

type BottomDrawerProps = {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  headerWrapperStyle?: string;
  heading: string;
  content?: React.ReactNode;
  type?: "main" | "dashboard";
  mode?: string;
};

const BottomDrawer: React.FC<BottomDrawerProps> = ({
  children,
  open,
  onClose,
  headerWrapperStyle,
  heading,
  content,
  type = "main",
}) => {
  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    setTimeout(() => {
      document.body.style.overflow = "hidden";
    }, 250);
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={`fixed inset-0 bg-dark-blue-cm/10 backdrop-blur-sm  max-tab-sm:block hidden z-[9991]`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              "fixed left-0 right-0 bottom-0  border border-gray-5/20  z-[9992] rounded-t-2xl max-tab-sm:block hidden pt-2",
              type == "main" ? "bg-white" : "bg-white"
            )}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(event, info) => {
              if (info.offset.y > 70) {
                onClose();
              }
            }}
          >
            <div
              className={cn(
                "w-12 h-1.5  rounded-full mx-auto mb-4",
                type == "main" ? "bg-gray-300" : "bg-gray-700"
              )}
            />
            <div
              className={cn(
                `rounded-[10px] overflow-hidden `,
                type == "main" ? "bg-light-300" : "bg-white "
              )}
            >
              <div
                className={cn(
                  headerWrapperStyle,
                  "flex flex-col gap-2.5 pb-5 px-4",
                  type == "main"
                    ? "bg-white"
                    : "bg-whtie border-b border-gray-700"
                )}
              >
                {heading && (
                  <div
                    className={cn(
                      "popover-heading  font-supreme text-xl leading-[1.346] font-bold capitalize",
                      type == "main" ? "text-black" : "text-accent-100"
                    )}
                  >
                    {heading}
                  </div>
                )}
                {content && (
                  <div
                    className={cn(
                      "text-sm font-normal font-supreme",
                      type == "main" ? "text-black" : "text-gray-2"
                    )}
                  >
                    {content}
                  </div>
                )}
              </div>
              <div className="py-5">
                <div className="overflow-auto max-h-[calc(100dvh-190px)] px-4">
                  {children}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomDrawer;
