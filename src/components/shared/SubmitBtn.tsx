import React from 'react';
import { Loader2 } from "lucide-react";

interface SubmitBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  isSubmitting?: boolean;
  submittingLabel?: string;
  fullWidth?: boolean;
}

export const SubmitBtn: React.FC<SubmitBtnProps> = ({
  label,
  isSubmitting,
  submittingLabel = 'Processing...',
  fullWidth = true,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <button
      type="submit"
      disabled={disabled || isSubmitting}
      className={`
        bg-button-primary hover:bg-primary-hover text-background font-semibold
        rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 
        hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-input-focus focus:ring-offset-2 
        focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed 
        flex items-center justify-center
        ${fullWidth ? 'w-full py-3.5 px-6 text-base border border-transparent' : 'px-4 sm:px-6'}
        ${className}
      `}
      {...props}
    >
      {isSubmitting ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          {submittingLabel}
        </span>
      ) : label}
    </button>
  );
};
