import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrustBadge } from '@/components/TrustBadge';
import { MeetSafePin } from '@/components/MeetSafePin';
import { OfferButton } from '@/components/OfferButton';
import { ListingCard } from '@/components/ListingCard';
import { ArrowLeft, Share2, Heart, MapPin, Eye, MessageSquare, Calendar, Shield, Radio, Package, Camera, CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  // Fetch listing by ID
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles(*),
      images:listing_images(*),
      category:categories(*),
      meet_safe_zone:meet_safe_zones(*)
    `)
    .eq('id', params.id)
    .single();

  if (listingError || !listing) {
    notFound();
  }

  // Increment view count
  await supabase.rpc('increment_view_count', { listing_id: params.id });

  // Fetch similar listings
  const { data: similarListings } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles(*),
      images:listing_images(*),
      category:categories(*)
    `)
    .eq('status', 'active')
    .neq('id', params.id)
    .eq('category_id', listing.category_id)
    .limit(3);

  const conditionColors = {
    'new': 'bg-green-500',
    'like-new': 'bg-blue-500',
    'good': 'bg-brand-500',
    'fair': 'bg-yellow-500',
    'poor': 'bg-red-500',
  };

  const images = listing.images?.map((img: any) => img.url) || ['/placeholder-image.png'];
  const selectedImage = 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/listings">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="flex-1 font-semibold text-gray-900 dark:text-white truncate">
              {listing.title}
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="p-2">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="relative aspect-[4/3]">
                <Image
                  src={images[selectedImage]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                />
                {listing.is_live && (
                  <Badge variant="destructive" className="absolute top-4 left-4 flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    LIVE
                  </Badge>
                )}
                {listing.is_bundle && (
                  <Badge variant="default" className="absolute top-4 left-4 flex items-center gap-1 ml-20">
                    <Package className="w-3 h-3" />
                    BUNDLE
                  </Badge>
                )}
                {listing.ai_condition_check && (
                  <Badge variant="success" className="absolute top-4 right-4 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    AI Verified
                  </Badge>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index
                          ? 'border-brand-500'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${listing.title} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {listing.title}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {listing.view_count || 0} views
                    </span>
                  </div>
                </div>
                <Badge className={`${conditionColors[listing.condition as keyof typeof conditionColors]} text-white`}>
                  {listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1).replace('-', ' ')}
                </Badge>
              </div>

              <p className="text-3xl font-bold text-brand-500 mb-6">
                {formatPrice(listing.price)}
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {listing.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Location</h3>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <MapPin className="w-5 h-5 text-brand-500" />
                    <span>{listing.address}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {listing.barangay}
                  </p>
                </div>

                {listing.ai_condition_check && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-800 dark:text-green-200">
                        AI Condition Check Passed
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      This item has been verified by our AI-powered condition detection system.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Meet-safe Zone Map */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Meet-safe Zone
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900" />
                <div className="relative z-10 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">Map view placeholder</p>
                  {listing.meet_safe_zone && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <MeetSafePin zone={listing.meet_safe_zone} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {listing.meet_safe_zone.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                Meet at verified safe zones for secure transactions
              </p>
            </div>

            {/* Similar Listings */}
            {similarListings && similarListings.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Similar Listings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similarListings.map((similarListing) => (
                    <ListingCard key={similarListing.id} listing={similarListing} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Seller Card and Actions */}
          <div className="space-y-6">
            {/* Seller Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <Image
                    src={listing.seller?.avatar_url || '/placeholder-avatar.png'}
                    alt={listing.seller?.full_name || 'Seller'}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                  {listing.seller?.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {listing.seller?.full_name || 'Seller'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {listing.seller?.barangay || 'Philippines'}
                  </p>
                  <TrustBadge score={listing.seller?.trust_score || 70} showLabel />
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Link href={`/profile/${listing.seller_id}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    View Profile
                  </Button>
                </Link>
                <Link href="/messages" className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    Message
                  </Button>
                </Link>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Response Rate</span>
                  <span className="font-medium text-gray-900 dark:text-white">95%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                  <span className="font-medium text-gray-900 dark:text-white">&lt; 1 hour</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {listing.seller?.created_at ? new Date(listing.seller.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <OfferButton onClick={() => {}} />
              <Button variant="outline" className="w-full" size="lg">
                <MessageSquare className="w-5 h-5 mr-2" />
                Chat with Seller
              </Button>
              <Button variant="ghost" className="w-full" size="lg">
                <Shield className="w-5 h-5 mr-2" />
                Report Listing
              </Button>
            </div>

            {/* Safety Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Safety Tips
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li>• Meet at verified safe zones</li>
                <li>• Check the item before paying</li>
                <li>• Use PayMongo for secure payments</li>
                <li>• Trust your instincts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
