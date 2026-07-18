"use client";

import { useState } from "react";
import { Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { getComplaintInsights } from "@/actions/aiActions";
import { MagicButton } from "@/components/ui/MagicButton";

export function ComplaintSummaryWidget() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate() {
    setIsLoading(true);
    try {
      const res = await getComplaintInsights();
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate insights.");
    } finally {
      setIsLoading(false);
    }
  }

  if (summary) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="flex items-start gap-3 relative z-10">
          <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
            <TrendingUp size={18} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-primary mb-1 flex items-center gap-2">
              AI Insights
              <Sparkles size={14} className="animate-pulse" />
            </h3>
            <div className="text-sm text-text-primary leading-relaxed font-medium">
              <ReactMarkdown
                components={{
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-text-primary" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="" {...props} />,
                }}
              >
                {summary}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <MagicButton
        onClick={handleGenerate}
        isProcessing={isLoading}
        label="Generate AI Insights"
        processingLabel="Analyzing Complaints..."
        className="w-full md:w-auto text-sm"
      />
    </div>
  );
}