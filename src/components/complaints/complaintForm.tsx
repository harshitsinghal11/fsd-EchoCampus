"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ComplaintForm() {
  const [complaint, setComplaint] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);

  async function submitComplaint() {
    if (!complaint.trim()) {
      toast.error("Please enter your complaint before submitting");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaint: complaint.trim(),
          isAnonymous,
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok || data.error) {
        toast.error(data.error || "Something went wrong.");
      } else {
        toast.success("Thank you! Your complaint has been submitted successfully.");
        setComplaint("");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const charCount = complaint.length;
  const maxChars = 500;

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
      <div className="bg-orange-500/10 border border-orange-500/20 px-6 py-4 rounded-xl">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-orange-400" />
          <h2 className="text-xl font-semibold text-white">Submit a Complaint</h2>
        </div>
        <p className="text-slate-300 text-sm mt-1">
          We value your feedback and will review your complaint promptly
        </p>
      </div>

      <div className="space-y-4 mt-4">
        <div>
          <textarea
            id="complaint"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Please provide detailed information about your complaint..."
            maxLength={maxChars}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all resize-none text-slate-100 placeholder-slate-400"
            rows={6}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-slate-400">
              Be as specific as possible to help us address your concern
            </span>
            <span className={`text-xs font-medium ${charCount > maxChars * 0.9 ? "text-orange-400" : "text-slate-400"}`}>
              {charCount} / {maxChars}
            </span>
          </div>
        </div>

      </div>

      <motion.button
        onClick={submitComplaint}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        disabled={loading || !complaint.trim()}
        className="w-full bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all mt-2 duration-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5 text-orange-400" />
            <span>Submit</span>
          </>
        )}
      </motion.button>
    </div>
  );
}