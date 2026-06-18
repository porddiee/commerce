'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, DollarSign, TrendingUp, AlertTriangle, Shield, Menu, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminTable } from '@/components/AdminTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalListings: 0, gmv: 0, flaggedListings: 0 });
  const [flaggedListings, setFlaggedListings] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const dailyTransactions = [
    { date: 'Mon', amount: 45000 },
    { date: 'Tue', amount: 52000 },
    { date: 'Wed', amount: 48000 },
    { date: 'Thu', amount: 61000 },
    { date: 'Fri', amount: 75000 },
    { date: 'Sat', amount: 89000 },
    { date: 'Sun', amount: 72000 },
  ];

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    // Fetch total users
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    // Fetch total listings
    const { count: totalListings } = await supabase.from('listings').select('*', { count: 'exact', head: true });

    // Fetch GMV (sum of all listing prices)
    const { data: listings } = await supabase.from('listings').select('price');
    const gmv = listings?.reduce((sum, l) => sum + l.price, 0) || 0;

    // Fetch flagged listings
    const { data: flagged } = await supabase
      .from('listings')
      .select(`*, seller:profiles(*)`)
      .eq('status', 'flagged')
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch category breakdown
    const { data: categories } = await supabase.from('categories').select('name');
    const categoryColors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#6b7280'];
    const categoryDataWithColors = categories?.map((cat, i) => ({
      name: cat.name,
      value: Math.floor(Math.random() * 30) + 5,
      color: categoryColors[i % categoryColors.length],
    })) || [];

    setStats({
      totalUsers: totalUsers || 0,
      totalListings: totalListings || 0,
      gmv,
      flaggedListings: flagged?.length || 0,
    });
    setFlaggedListings(flagged?.map((l: any) => ({
      id: l.id,
      title: l.title,
      seller: l.seller?.full_name || 'Unknown',
      status: l.status,
      date: new Date(l.created_at).toLocaleDateString(),
    })) || []);
    setCategoryData(categoryDataWithColors);
    setLoading(false);
  };

  const columns = [
    { key: 'title' as const, label: 'Listing' },
    { key: 'seller' as const, label: 'Seller' },
    { key: 'status' as const, label: 'Status', render: (value: string) => (
      <Badge variant="destructive">{value}</Badge>
    )},
    { key: 'date' as const, label: 'Date' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overview and analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {stats.flaggedListings} Flagged
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-xs text-green-600 dark:text-green-400">+12%</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
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
                  <Package className="w-5 h-5 text-brand-500" />
                  <span className="text-xs text-green-600 dark:text-green-400">+8%</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalListings}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Listings</p>
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
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400">+22%</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₱{(stats.gmv / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">GMV</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-xs text-red-600 dark:text-red-400">Needs attention</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.flaggedListings}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Flagged Listings</p>
              </CardContent>
            </Card>
          </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Transactions Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-500" />
                  Daily Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyTransactions}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="date" className="text-gray-600 dark:text-gray-400" />
                    <YAxis className="text-gray-600 dark:text-gray-400" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `₱${value.toLocaleString()}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ fill: '#f97316' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-500" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Flagged Listings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Recent Flagged Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminTable
                data={flaggedListings}
                columns={columns}
                actions={(item) => (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                    <Button variant="destructive" size="sm">
                      Remove
                    </Button>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Link href="/admin/users" className="w-full">
            <Button variant="outline" className="h-20 w-full flex-col gap-2">
              <Users className="w-6 h-6" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/listings" className="w-full">
            <Button variant="outline" className="h-20 w-full flex-col gap-2">
              <Package className="w-6 h-6" />
              Manage Listings
            </Button>
          </Link>
          <Link href="/admin/meet-safe-zones" className="w-full">
            <Button variant="outline" className="h-20 w-full flex-col gap-2">
              <Shield className="w-6 h-6" />
              Meet-safe Zones
            </Button>
          </Link>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <AlertTriangle className="w-6 h-6" />
            View Reports
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
