"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, MessageSquare, Loader2 } from "lucide-react";
import { SubmitBtn } from "@/components/shared/SubmitBtn";
import { toast } from "sonner";
import { submitComplaint } from "@/actions/complaintActions";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/shared/ui/GlassCard";
import { FormTextarea } from "@/components/shared/ui/FormTextarea";

export default function ComplaintForm() {
  const router = useRouter();
  const [complaint, setComplaint] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!complaint.trim()) {
      toast.error("Please enter your complaint before submitting");
      return;
    }

    setLoading(true);

    try {
      const result = await submitComplaint({
        complaint: complaint.trim(),
        isAnonymous,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Thank you! Your complaint has been submitted successfully.");
        setComplaint("");
        router.refresh();
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
    <GlassCard className="p-6 space-y-4">
      <div className="bg-primary/10 border border-primary/30 px-6 py-4 rounded-xl">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-text-primary">Submit a Complaint</h2>
        </div>
        <p className="text-text-secondary text-sm mt-1">
          We value your feedback and will review your complaint promptly
        </p>
      </div>

      <div className="mt-4">
        <FormTextarea
          id="complaint"
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder="Please provide detailed information about your complaint..."
          maxLength={maxChars}
          rows={6}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-text-muted">
            Be as specific as possible to help us address your concern
          </span>
          <span className={`text-xs font-medium ${charCount > maxChars * 0.9 ? "text-primary" : "text-text-muted"}`}>
            {charCount} / {maxChars}
          </span>
        </div>
      </div>

      <SubmitBtn
        type="button"
        onClick={handleSubmit}
        disabled={loading || !complaint.trim()}
        isSubmitting={loading}
        label="Submit"
      />
    </GlassCard>
  );
}