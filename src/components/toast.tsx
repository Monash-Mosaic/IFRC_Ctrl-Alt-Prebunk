'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setShouldRender(false);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !shouldRender) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-[#011E41] text-white px-6 py-4 rounded-lg shadow-2xl',
        'flex items-center gap-3 min-w-[280px] max-w-[90vw]',
        'transform transition-all duration-300 ease-in-out',
        shouldRender && isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={() => {
          setShouldRender(false);
          setTimeout(onClose, 300);
        }}
        className="shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Close notification"
      >
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
