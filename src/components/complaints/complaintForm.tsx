"use client";

import { useState } from "react";
import { AlignLeft } from "lucide-react";
import { SubmitBtn } from "@/components/shared/SubmitBtn";
import { toast } from "sonner";
import { submitComplaint } from "@/actions/complaintActions";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/shared/ui/GlassCard";
import { FormTextarea } from "@/components/shared/ui/FormTextarea";

export default function ComplaintForm() {
  const router = useRouter();
  const [complaint, setComplaint] = useState("");
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
        isAnonymous: true,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Thank you! Your complaint has been submitted successfully.");
        setComplaint("");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const charCount = complaint.length;
  const maxChars = 500;

  return (
    <GlassCard className="p-6 md:p-8 space-y-5">
      <div className="space-y-5">
        <FormTextarea
          id="complaint"
          label="Complaint Details"
          icon={AlignLeft}
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder="Please provide detailed information about your complaint..."
          maxLength={maxChars}
          rows={6}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-text-muted mr-1">
            Be as specific as possible to help us address your concern
          </span>
          <span className={`text-xs font-medium text-right tabular-nums min-w-[4.5rem] ${charCount > maxChars * 0.9 ? "text-primary" : "text-text-muted"}`}>
            {charCount} / {maxChars}
          </span>
        </div>
      </div>

      <SubmitBtn
        type="button"
        onClick={handleSubmit}
        disabled={loading || !complaint.trim()}
        isSubmitting={loading}
        label="Submit Complaint"
        submittingLabel="Analyzing with AI..."
      />
    </GlassCard>
  );
}