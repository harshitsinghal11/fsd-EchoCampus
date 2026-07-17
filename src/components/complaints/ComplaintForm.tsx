"use client";

import { useState } from "react";
import { AlignLeft } from "lucide-react";
import { SubmitBtn } from "@/components/shared/SubmitBtn";
import { toast } from "sonner";
import { submitComplaint } from "@/actions/complaintActions";
import { enhanceComplaint } from "@/actions/aiActions";
import { useRouter } from "next/navigation";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { GlassCard } from "@/components/ui/GlassCard";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { MagicButton } from "@/components/ui/MagicButton";

export default function ComplaintForm() {
  const router = useRouter();
  const [complaint, setComplaint] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const { loading, execute } = useFormSubmit();
  const [isEnhancing, setIsEnhancing] = useState(false);

  async function handleEnhance() {
    if (!complaint.trim()) {
      toast.error("Please enter a complaint to enhance first.");
      return;
    }

    setIsEnhancing(true);
    try {
      const result = await enhanceComplaint(complaint);
      if (result.error) throw new Error(result.error);

      if (result.enhancedText) {
        setComplaint(result.enhancedText);
        toast.success("✨ Complaint Enhanced!");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to enhance.");
    } finally {
      setIsEnhancing(false);
    }
  }

  async function handleSubmit() {
    if (!complaint.trim()) {
      toast.error("Please enter your complaint before submitting");
      return;
    }

    await execute(
      () => submitComplaint({
        complaint: complaint.trim(),
        isAnonymous,
      }),
      () => {
        setComplaint("");
        setIsAnonymous(true);
        router.refresh();
      },
      "Thank you! Your complaint has been submitted successfully."
    );
  }

  const charCount = complaint.length;
  const maxChars = 500;

  return (
    <GlassCard className="p-6 md:p-8">
      <div className="space-y-5">
        <FormTextarea
          id="complaint"
          icon={AlignLeft}
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder="Please provide detailed information about your complaint..."
          maxLength={maxChars}
          rows={6}
        />
        <div className="flex justify-between items-center mt-2">
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary bg-surface-hover w-4 h-4 select-none"
            />
            Submit Anonymously
          </label>
          <span className={`text-xs font-medium text-right tabular-nums min-w-[4.5rem] ${charCount > maxChars * 0.9 ? "text-primary" : "text-text-muted"}`}>
            {charCount} / {maxChars}
          </span>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <MagicButton
            onClick={handleEnhance}
            disabled={isEnhancing || loading || !complaint.trim()}
            isProcessing={isEnhancing}
            label="Enhance Complaint"
            processingLabel="AI Thinking..."
          />

          <SubmitBtn
            type="button"
            onClick={handleSubmit}
            disabled={loading || !complaint.trim()}
            isSubmitting={loading}
            label="Submit Complaint"
            submittingLabel="Submitting Complaint..."
          />
        </div>
      </div>
    </GlassCard>
  );
}