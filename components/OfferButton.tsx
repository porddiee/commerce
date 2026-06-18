'use client';

import { Handshake } from 'lucide-react';
import { Button } from './ui/button';

interface OfferButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
}

export function OfferButton({ onClick, disabled = false, variant = 'default' }: OfferButtonProps) {
  return (
    <div className="hover:scale-[1.02] active:scale-[0.98] transition-transform">
      <Button
        onClick={onClick}
        disabled={disabled}
        variant={variant}
        className="w-full sm:w-auto"
        size="lg"
      >
        <Handshake className="w-5 h-5 mr-2" />
        Make Offer
      </Button>
    </div>
  );
}
