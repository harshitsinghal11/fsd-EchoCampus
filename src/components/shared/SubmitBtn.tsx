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
      disabled={disabled || isSubmitting}
      className={`
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isSubmitting ? submittingLabel : label}
    </Button>
  );
};