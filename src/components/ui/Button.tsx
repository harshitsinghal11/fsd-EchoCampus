import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isSubmitting?: boolean;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isSubmitting = false,
      href,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70 disabled:cursor-not-allowed shadow-sm";

    const variants = {
      primary: "bg-button-primary hover:bg-primary-hover text-text-primary shadow-primary/20",
      secondary: "bg-surface-hover text-text-secondary hover:text-text-primary",
      danger: "bg-surface-hover text-text-secondary hover:bg-danger/20 hover:text-danger",
      ghost: "bg-transparent shadow-none hover:bg-surface-hover text-text-secondary hover:text-text-primary",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg",
      icon: "h-9 w-9 p-1.5",
    };

    const combinedClasses = [
      baseStyles,
      variants[variant],
      sizes[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // If href is provided, render as a Link (styled as a button)
    if (href) {
      return (
        <Link href={href} className={combinedClasses}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || isSubmitting}
        {...props}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {typeof children === "string" ? "Processing..." : children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
