"use client";

import Link from "next/link";
import { Home, ArrowLeft, SearchX } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-lg w-full text-center relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="relative inline-block mb-8"
        >
          <div className="text-[12rem] font-extrabold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-surface-hover to-surface select-none">
            404
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-surface-hover border border-border rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 rotate-12">
            <SearchX className="w-12 h-12 text-primary" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-4">
          Page not found
        </h1>

        <p className="text-text-muted mb-10 text-base leading-relaxed max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or never existed in the first place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href={ROUTES.STUDENT.DASHBOARD}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-surface-hover text-text-secondary font-medium hover:bg-surface-hover hover:text-text-primary transition-all border border-border shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Link>


          <Link
            href={ROUTES.HOME}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-primary text-background font-semibold hover:bg-primary-light"
          >
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Link>
        </div>
      </motion.div >
    </div >
  );
}
