import { createClient } from '@/lib/supabase/server';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Star, MessageSquare, Share2, Shield, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrustBadge } from '@/components/TrustBadge';
import { ListingCard } from '@/components/ListingCard';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  // Fetch user profile
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (userError || !user) {
    notFound();
  }

  // Fetch user's listings
  const { data: userListings } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles(*),
      images:listing_images(*),
      category:categories(*)
    `)
    .eq('seller_id', params.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6);

  // Fetch reviews for this user
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles(*)
    `)
    .eq('reviewee_id', params.id)
    .order('created_at', { ascending: false });

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-brand-500">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 h-32" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-6 -mt-16">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden shadow-lg">
                  <Image
                    src={user.avatar_url || '/placeholder-avatar.png'}
                    alt={user.full_name || 'User'}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                </div>
                {user.is_verified && (
                  <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {user.full_name || 'User'}
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {user.barangay || 'Philippines'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <TrustBadge score={user.trust_score || 70} showLabel />
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">{averageRating.toFixed(1)}</span>
                    <span className="text-gray-600 dark:text-gray-400">({reviews?.length || 0} reviews)</span>
                  </div>
                </div>

                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{userListings?.length || 0}</p>
                    <p className="text-gray-600 dark:text-gray-400">Listings</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">95%</p>
                    <p className="text-gray-600 dark:text-gray-400">Response Rate</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">&lt;1h</p>
                    <p className="text-gray-600 dark:text-gray-400">Response Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Listings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Listings</h2>
                <Badge variant="outline">{userListings?.length || 0} items</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userListings && userListings.length > 0 ? (
                  userListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 py-8 col-span-2">No active listings</p>
                )}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Reviews</h2>
              <div className="space-y-4">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                            <span className="text-brand-600 dark:text-brand-400 font-semibold">
                              {review.reviewer?.full_name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{review.reviewer?.full_name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 py-8">No reviews yet</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trust Score Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-500" />
                Trust Score Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Verified Identity</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Response Rate</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">95%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Successful Sales</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">28</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Safety Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
            >
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Safety Tips
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li>• Check the seller&apos;s trust score</li>
                <li>• Meet at verified safe zones</li>
                <li>• Inspect items before payment</li>
                <li>• Use PayMongo for secure payments</li>
              </ul>
            </motion.div>

            {/* Report User */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button variant="outline" className="w-full">
                Report User
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
