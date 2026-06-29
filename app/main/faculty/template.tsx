"use client";
import { motion } from "framer-motion";

export default function FacultyTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex-1 flex flex-col h-full w-full min-h-0"
    >
      {children}
    </motion.div>
  );
}
