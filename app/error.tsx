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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full bg-surface-hover backdrop-blur-xl border border-border p-8 rounded-3xl shadow-2xl shadow-danger/20 text-center"
      >
        <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-danger/20">
          <AlertTriangle className="w-10 h-10 text-danger" />
        </div>

        <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
          Something went wrong
        </h1>
        
        <p className="text-text-muted mb-8 text-sm leading-relaxed">
          We apologize, but an unexpected error occurred. Our team has been notified. 
          Please try again or return to the dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-surface-hover text-text-primary font-medium hover:bg-surface-hover transition-colors border border-border"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try again
          </button>
          
          <Link
            href={ROUTES.HOME}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-success/10 text-primary font-medium hover:bg-primary-hover/20 transition-colors border border-primary/20"
          >
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Link>
        </div>
        
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-background rounded-xl border border-border text-left overflow-auto text-xs font-mono text-danger">
            <p className="font-semibold text-text-primary mb-1">Developer Error Details:</p>
            {error.message}
          </div>
        )}
      </motion.div>
    </div>
  );
}
