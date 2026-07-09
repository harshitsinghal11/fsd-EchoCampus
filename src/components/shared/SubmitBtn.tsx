import React from 'react';
import { Button } from "@/components/ui/Button";

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
    <Button
      type="submit"
      variant="primary"
      size={fullWidth ? "lg" : "md"}
      disabled={disabled || isSubmitting}
      isSubmitting={isSubmitting}
      className={`${fullWidth ? 'w-full mt-2' : ''} ${className}`}
      {...props}
    >
      {isSubmitting ? submittingLabel : label}
    </Button>
  );
};
