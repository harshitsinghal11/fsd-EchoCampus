"use client";
import { motion, Variants } from "framer-motion";
import React from "react";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", ease: "easeOut", duration: 0.25 }
  }
};

interface MotionItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export function MotionItem({ children, className, onClick }: MotionItemProps) {
  return (
    <motion.div variants={itemVariants} className={className} onClick={onClick}>
      {children}
    </motion.div>
  );
}
