'use client';

import { MapPin, ShoppingBag, Building2, Store } from 'lucide-react';
import { MeetSafeZone } from '@/types';
import { cn } from '@/lib/utils';

interface MeetSafePinProps {
  zone: MeetSafeZone;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function MeetSafePin({ zone, size = 'md', showLabel = false }: MeetSafePinProps) {
  const getIcon = () => {
    switch (zone.type) {
      case 'mall':
        return ShoppingBag;
      case 'police':
        return Building2;
      case 'convenience-store':
        return Store;
      default:
        return MapPin;
    }
  };

  const Icon = getIcon();

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className="relative group">
      <div
        className={cn(
          'bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg',
          sizeClasses[size]
        )}
      >
        <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
      </div>
      {showLabel && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {zone.name}
        </div>
      )}
    </div>
  );
}
