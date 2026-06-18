'use client';

import { useState, useEffect } from 'react';
import { Search, X, Map, List, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { ListingCard } from '@/components/ListingCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function SearchPage() {
  const supabase = createClient();
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [recentSearches, setRecentSearches] = useState<string[]>(['iPhone', 'Mountain bike', 'Designer bag']);
  const [trendingSearches, setTrendingSearches] = useState<string[]>(['PS5', 'MacBook', 'Gaming laptop', 'Vintage vinyl']);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      searchListings();
    } else {
      setListings([]);
    }
  }, [query]);

  const searchListings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('listings')
      .select(`
        *,
        seller:profiles(*),
        images:listing_images(*),
        category:categories(*)
      `)
      .eq('status', 'active')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50);
    setListings(data || []);
    setLoading(false);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const clearRecentSearch = (search: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== search));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search for anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="w-4 h-4 mr-2" />
                Map
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!query ? (
          <div className="max-w-2xl mx-auto">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Searches
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setRecentSearches([])}>
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <Badge
                      key={search}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearRecentSearch(search);
                        }}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Now
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trendingSearches.map((search, index) => (
                  <button
                    key={search}
                    onClick={() => handleSearch(search)}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 transition-colors text-left hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="text-2xl font-bold text-brand-500 w-8">#{index + 1}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{search}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Tips */}
            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">Search Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li>• Use specific keywords for better results</li>
                <li>• Try different spellings or abbreviations</li>
                <li>• Search by category, brand, or condition</li>
                <li>• Use filters to narrow down your results</li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            {/* Search Results */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {listings.length} results for &quot;{query}&quot;
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              </div>
            ) : viewMode === 'list' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl h-[600px] flex items-center justify-center border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Map view coming soon</p>
                </div>
              </div>
            )}

            {!loading && listings.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try different keywords or check your spelling
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {trendingSearches.slice(0, 3).map((search) => (
                    <Badge
                      key={search}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
