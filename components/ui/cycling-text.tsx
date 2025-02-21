'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CyclingTextProps {
  messages: string[];
  className?: string;
  interval?: number;
}

export function CyclingText({ messages, className, interval = 2000 }: CyclingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, messages.length]);

  return (
    <div className={cn(
      "text-center transition-opacity duration-500",
      "min-h-[1.5em]", // Prevent layout shift
      className
    )}>
      <p
        key={currentIndex} // Force re-render for animation
        className="animate-fade-in"
      >
        {messages[currentIndex]}
      </p>
    </div>
  );
}
