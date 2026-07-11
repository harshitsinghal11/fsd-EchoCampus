import React from "react";
import { Sparkles } from "lucide-react";

interface MagicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isProcessing: boolean;
  label: string;
  processingLabel: string;
}

export function MagicButton({
  isProcessing,
  label,
  processingLabel,
  className = "",
  ...props
}: MagicButtonProps) {
  return (
    <button
      type="button"
      className={`w-full flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 hover:scale-[0.98] h-11 px-6 border text-base ${isProcessing
        ? "bg-primary/10 border-primary/30 text-primary animate-pulse shadow-sm"
        : "bg-surface hover:bg-surface-hover border-border text-text shadow-sm hover:shadow-md hover:border-primary/50"
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}>
      <Sparkles
        size={18}
        className={isProcessing ? "animate-spin" : "text-primary"} />
      {isProcessing ? processingLabel : label}
    </button>
  );
}
