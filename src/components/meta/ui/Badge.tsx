// src/components/ui/Badge.tsx
import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'success', children }) => {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      {
        'bg-green-100 text-green-800': variant === 'success',
        'bg-yellow-100 text-yellow-800': variant === 'warning',
        'bg-red-100 text-red-800': variant === 'error',
        'bg-blue-100 text-blue-800': variant === 'info',
      }
    )}>
      {children}
    </span>
  );
};
