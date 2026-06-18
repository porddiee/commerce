'use client';

import { motion } from 'framer-motion';
import { Bell, MapPin, Eye, MessageSquare, Package, Radio } from 'lucide-react';
import { Listing } from '@/types';
import { formatPrice, formatDistance } from '@/lib/utils';
import { Badge } from './ui/badge';
import { TrustBadge } from './TrustBadge';
import Image from 'next/image';

interface ListingCardProps {
  listing: Listing;
  onClick?: () => void;
}

export function ListingCard({ listing, onClick }: ListingCardProps) {
  const distance = Math.random() * 5 + 0.5; // Mock distance

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={listing.images[0]}
          alt={listing.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 left-2 flex gap-2">
          {listing.isLive && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Radio className="w-3 h-3" />
              LIVE
            </Badge>
          )}
          {listing.isBundle && (
            <Badge variant="default" className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              BUNDLE
            </Badge>
          )}
        </div>
        <button className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors">
          <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {formatDistance(distance)}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
            {listing.title}
          </h3>
        </div>

        <p className="text-2xl font-bold text-brand-500 mb-2">
          {formatPrice(listing.price)}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{listing.location.barangay}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {listing.views}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {listing.offers}
            </span>
          </div>
          <TrustBadge score={listing.seller.trustScore} size="sm" />
        </div>
      </div>
    </motion.div>
  );
}
