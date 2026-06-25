"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ROUTES } from "@/lib/routes";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Runtime Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl shadow-red-900/20 text-center"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>

        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          Something went wrong
        </h1>
        
        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
          We apologize, but an unexpected error occurred. Our team has been notified. 
          Please try again or return to the dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try again
          </button>
          
          <Link
            href={ROUTES.HOME}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-teal-500/10 text-teal-400 font-medium hover:bg-teal-500/20 transition-colors border border-teal-500/20"
          >
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Link>
        </div>
        
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-slate-950 rounded-xl border border-slate-800 text-left overflow-auto text-xs font-mono text-red-400">
            <p className="font-semibold text-white mb-1">Developer Error Details:</p>
            {error.message}
          </div>
        )}
      </motion.div>
    </div>
  );
}
