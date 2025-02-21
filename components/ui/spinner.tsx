'use client';

import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn(
      "relative",
      sizeClasses[size],
      className
    )}>
      <div className={cn(
        "animate-spin rounded-full border-4 border-solid",
        "border-purple-400 border-r-transparent",
        "absolute inset-0",
        "shadow-[0_0_15px_rgba(168,85,247,0.5)]", // Glowing effect
      )} />
    </div>
  );
}
