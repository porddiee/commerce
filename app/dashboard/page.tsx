'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, Eye, Package, TrendingUp, DollarSign, Bell, Menu, X, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListingCard } from '@/components/ListingCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function DashboardPage() {
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ totalListings: 0, totalViews: 0, totalOffers: 0, revenue: 0 });
  const [activeListings, setActiveListings] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch user's listings
    const { data: listings } = await supabase
      .from('listings')
      .select(`
        *,
        seller:profiles(*),
        images:listing_images(*),
        category:categories(*)
      `)
      .eq('seller_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4);

    // Fetch stats
    const { data: statsData } = await supabase
      .from('listings')
      .select('view_count, price')
      .eq('seller_id', user.id);

    const totalViews = statsData?.reduce((sum, l) => sum + (l.view_count || 0), 0) || 0;
    const revenue = statsData?.reduce((sum, l) => sum + l.price, 0) || 0;

    // Fetch offers count
    const { count: offersCount } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .in('listing_id', listings?.map((l: any) => l.id) || []);

    // Fetch recent conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select(`
        *,
        participants:profiles(*),
        messages(*)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('updated_at', { ascending: false })
      .limit(5);

    setActiveListings(listings || []);
    setStats({
      totalListings: listings?.length || 0,
      totalViews,
      totalOffers: offersCount || 0,
      revenue,
    });
    setRecentMessages(conversations || []);
    setLoading(false);
  };

  const revenueData = [
    { name: 'Jan', revenue: 15000 },
    { name: 'Feb', revenue: 22000 },
    { name: 'Mar', revenue: 18000 },
    { name: 'Apr', revenue: 32000 },
    { name: 'May', revenue: 28000 },
    { name: 'Jun', revenue: 45000 },
  ];

  const viewsData = [
    { name: 'Mon', views: 120 },
    { name: 'Tue', views: 180 },
    { name: 'Wed', views: 150 },
    { name: 'Thu', views: 220 },
    { name: 'Fri', views: 280 },
    { name: 'Sat', views: 350 },
    { name: 'Sun', views: 310 },
  ];


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-500 rounded-full" />
              </Button>
              <Link href="/listings/new">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Listing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Package className="w-5 h-5 text-brand-500" />
                      <span className="text-xs text-green-600 dark:text-green-400">+12%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalListings}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Listings</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Eye className="w-5 h-5 text-blue-500" />
                      <span className="text-xs text-green-600 dark:text-green-400">+8%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalViews}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <MessageSquare className="w-5 h-5 text-purple-500" />
                      <span className="text-xs text-green-600 dark:text-green-400">+15%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalOffers}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Offers Received</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400">+22%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(stats.revenue)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-500" />
                    Revenue Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400" />
                      <YAxis className="text-gray-600 dark:text-gray-400" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => formatPrice(value)}
                      />
                      <Bar dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Views Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    Weekly Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={viewsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400" />
                      <YAxis className="text-gray-600 dark:text-gray-400" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active Listings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Listings</h2>
                <Link href="/listings" className="text-brand-500 hover:text-brand-600 font-medium text-sm">
                  View All →
                </Link>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                </div>
              ) : activeListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 py-8">No active listings</p>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/listings/new" className="w-full block">
                  <Button className="w-full" size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Post New Listing
                  </Button>
                </Link>
                <Link href="/messages" className="w-full block">
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    View Messages
                  </Button>
                </Link>
                <Link href="/listings" className="w-full block">
                  <Button variant="outline" className="w-full">
                    <Package className="w-5 h-5 mr-2" />
                    Manage Listings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMessages.length > 0 ? (
                    recentMessages.map((conversation: any) => {
                      const otherUser = conversation.participants?.find((p: any) => p.id !== conversation.user1_id) || conversation.participants?.[0];
                      const lastMessage = conversation.messages?.[conversation.messages.length - 1];
                      return (
                        <Link
                          key={conversation.id}
                          href="/messages"
                          className="block"
                        >
                          <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center flex-shrink-0">
                              <span className="text-brand-600 dark:text-brand-400 font-semibold">
                                {otherUser?.full_name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {otherUser?.full_name || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {lastMessage?.content || 'No messages'}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm py-4">No recent messages</p>
                  )}
                </div>
                <Link href="/messages" className="w-full block">
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View All Messages
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Performance Tips */}
            <Card className="bg-gradient-to-br from-brand-500 to-brand-600 text-white border-none">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">💡 Tips to Boost Sales</h3>
                <ul className="space-y-2 text-sm text-brand-100">
                  <li>• Add more photos to your listings</li>
                  <li>• Respond to messages within 1 hour</li>
                  <li>• Use meet-safe zones for transactions</li>
                  <li>• Price competitively in your area</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
