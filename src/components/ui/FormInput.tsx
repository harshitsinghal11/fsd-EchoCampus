import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, icon: Icon, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && <label className="block text-sm font-semibold text-text-secondary">{label}</label>}
        <div className="relative group">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon className={`h-5 w-5 transition-colors ${error ? 'text-danger' : 'text-text-disabled group-focus-within:text-primary'}`} />
            </div>
          )}
          <input
            ref={ref}
            className={`w-full py-3 md:py-3.5 bg-surface border rounded-xl text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 transition-all duration-200 hover:bg-surface-hover ${Icon ? 'pl-11 pr-4' : 'px-4'} ${
              error 
                ? "border-danger/50 focus:ring-danger/50 focus:border-danger/50" 
                : "border-border focus:ring-input-focus/50 focus:border-primary/50"
            } ${className}`}
            {...props}
          />
        </div>
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
