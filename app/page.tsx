import { getListings } from '@/lib/supabase/queries/listings';
import { createClient } from '@/lib/supabase/server';
import { ListingCard } from '@/components/ListingCard';
import { CategoryPill } from '@/components/CategoryPill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createClient();
  
  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  // Fetch featured listings (active, recent)
  const { data: featuredListings } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles(*),
      images:listing_images(*),
      category:categories(*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6);

  // Fetch trending listings (high view count)
  const { data: trendingListings } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles(*),
      images:listing_images(*),
      category:categories(*)
    `)
    .eq('status', 'active')
    .order('view_count', { ascending: false })
    .limit(3);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-brand-500">Habol</h1>
              <div className="hidden md:flex items-center gap-6">
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-brand-500 transition-colors">
                  Browse
                </a>
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-brand-500 transition-colors">
                  Categories
                </a>
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-brand-500 transition-colors">
                  Meet-safe Zones
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button className="hidden sm:block">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-500 to-brand-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Buy & Sell Near You
            </h2>
            <p className="text-lg md:text-xl text-brand-100 mb-8">
              The trusted marketplace for your barangay community
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="What are you looking for?"
                  className="pl-12 h-12 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Manila</span>
              </div>
              <Button size="lg" className="h-12 px-8">
                Search
              </Button>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-8 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Link href="/listings">
              <CategoryPill category={{ id: 'all', name: 'All', icon: '🔍', slug: 'all' }} />
            </Link>
            {categories?.map((category) => (
              <Link key={category.id} href={`/listings?category=${category.slug}`}>
                <CategoryPill category={category} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Featured Near You
            </h3>
            <a href="/listings" className="text-brand-500 hover:text-brand-600 font-medium">
              View All →
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings?.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            )) || <p className="text-gray-500">No listings available</p>}
          </div>
        </div>
      </section>

      {/* Trending Items */}
      <section className="py-12 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            🔥 Trending in Your Area
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingListings?.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            )) || <p className="text-gray-500">No trending listings</p>}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-brand-500 to-brand-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Start Selling Today
          </h3>
          <p className="text-brand-100 mb-8 text-lg">
            Join thousands of Filipinos buying and selling safely in their communities
          </p>
          <Link href="/listings/new">
            <Button size="lg" variant="outline" className="bg-white text-brand-500 hover:bg-gray-100">
              Post Your First Listing
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold text-brand-500 mb-4">Habol</h4>
              <p className="text-gray-400 text-sm">
                The trusted hyper-local marketplace for the Philippines
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Browse</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">All Listings</a></li>
                <li><a href="#" className="hover:text-white">Categories</a></li>
                <li><a href="#" className="hover:text-white">Meet-safe Zones</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Safety Tips</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 Habol. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
