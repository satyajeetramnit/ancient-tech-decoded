'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ContextualOverlayProps {
  position?: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'center-right' | 'center-left';
  className?: string;
  children: React.ReactNode;
  visible?: boolean;
}

export const ContextualOverlay: React.FC<ContextualOverlayProps> = ({
  position = 'bottom-center',
  className,
  children,
  visible = true,
}) => {
  if (!visible) return null;

  const positionClasses = {
    'bottom-center': 'bottom-8 left-1/2 -translate-x-1/2 max-w-2xl w-[92vw]',
    'bottom-left': 'bottom-8 left-8 max-w-lg w-[90vw]',
    'bottom-right': 'bottom-8 right-8 max-w-lg w-[90vw]',
    'center-right': 'top-1/2 -translate-y-1/2 right-8 max-w-md w-[85vw]',
    'center-left': 'top-1/2 -translate-y-1/2 left-8 max-w-md w-[85vw]',
  };

  return (
    <div
      className={cn(
        'fixed z-20 pointer-events-auto transition-all duration-500 ease-out transform',
        positionClasses[position],
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none',
        className
      )}
    >
      <div className="glass-panel p-6 rounded-sm shadow-2xl relative overflow-hidden border border-gold-antique/25">
        {/* Subtle decorative gold corner notches */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-gold-antique/60" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-gold-antique/60" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-gold-antique/60" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-gold-antique/60" />

        {children}
      </div>
    </div>
  );
};
