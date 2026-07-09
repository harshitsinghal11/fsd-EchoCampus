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
        bg-button-primary hover:bg-primary-hover text-text-primary font-semibold
        rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 
        hover:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-primary focus-visible:ring-offset-2 
        focus-visible:ring-offset-background disabled:opacity-70 disabled:cursor-not-allowed 
        flex items-center justify-center
        ${fullWidth ? 'w-full py-3.5 px-6 text-base md:text-lg mt-2' : 'px-4 sm:px-6'}
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
