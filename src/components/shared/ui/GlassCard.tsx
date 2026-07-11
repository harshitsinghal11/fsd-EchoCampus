import React from 'react';

export function GlassCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-surface border border-border rounded-[1.5rem] md:rounded-3xl shadow-sm p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
}
