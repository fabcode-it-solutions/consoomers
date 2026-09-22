"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
const Wrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  
   const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ ease: "easeInOut", duration: 0.25 }}
      className={className || ""}
    >
      {children}
    </motion.div>
  );
};

export default Wrapper;
