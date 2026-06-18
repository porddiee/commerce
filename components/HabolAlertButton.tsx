'use client';

import { useState } from 'react';
import { Bell, X, Plus, Search, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface HabolAlertButtonProps {
  listingId?: string;
}

export function HabolAlertButton({ listingId }: HabolAlertButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [alertType, setAlertType] = useState<'price' | 'item' | 'category'>('price');
  const [targetPrice, setTargetPrice] = useState('');
  const [keywords, setKeywords] = useState('');
  const [radius, setRadius] = useState(5);

  const handleSetAlert = () => {
    console.log('Setting alert:', { alertType, targetPrice, keywords, radius, listingId });
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
      </Button>

      {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Set Habol Alert</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when items match your criteria</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Alert Type Selector */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setAlertType('price')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    alertType === 'price'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <DollarSign className="w-5 h-5 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Price Watch</span>
                </button>
                <button
                  onClick={() => setAlertType('item')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    alertType === 'item'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Search className="w-5 h-5 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Item Match</span>
                </button>
                <button
                  onClick={() => setAlertType('category')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    alertType === 'category'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Plus className="w-5 h-5 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Category</span>
                </button>
              </div>

              {/* Alert Form */}
              <div className="space-y-4">
                {alertType === 'price' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Price (₱)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter your target price"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                    />
                  </div>
                )}

                {alertType === 'item' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Keywords
                    </label>
                    <Input
                      placeholder="e.g., iPhone 14, gaming laptop"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>
                )}

                {alertType === 'category' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="">Select category</option>
                      <option value="electronics">Electronics</option>
                      <option value="fashion">Fashion</option>
                      <option value="home-garden">Home & Garden</option>
                      <option value="vehicles">Vehicles</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Radius
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="flex-1 accent-brand-500"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-16">
                      {radius}km
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSetAlert} className="flex-1">
                  <Bell className="w-4 h-4 mr-2" />
                  Set Alert
                </Button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
