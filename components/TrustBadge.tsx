'use client';

import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function TrustBadge({ score, size = 'md', showLabel = false }: TrustBadgeProps) {
  const getColor = () => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-brand-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getIcon = () => {
    if (score >= 90) return ShieldCheck;
    if (score >= 70) return Shield;
    return ShieldAlert;
  };

  const Icon = getIcon();

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-full text-white font-medium',
        getColor(),
        sizeClasses[size]
      )}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
      <span>{score}</span>
      {showLabel && <span className="hidden sm:inline">Trust Score</span>}
    </div>
  );
}
