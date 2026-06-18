'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter, CheckCircle, XCircle, AlertTriangle, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminTable } from '@/components/AdminTable';
import { createClient } from '@/lib/supabase/client';

export default function AdminListingsPage() {
  const supabase = createClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [allListings, setAllListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select(`
        *,
        seller:profiles(*),
        category:categories(*)
      `)
      .order('created_at', { ascending: false });
    
    setAllListings(data?.map((l: any) => ({
      id: l.id,
      title: l.title,
      seller: l.seller?.full_name || 'Unknown',
      price: l.price,
      category: l.category?.name || 'N/A',
      status: l.status,
      date: l.created_at ? new Date(l.created_at).toLocaleDateString() : 'N/A',
    })) || []);
    setLoading(false);
  };

  const filteredListings = statusFilter === 'all'
    ? allListings
    : allListings.filter((l) => l.status === statusFilter);

  const columns = [
    { key: 'title' as const, label: 'Title', sortable: true },
    { key: 'seller' as const, label: 'Seller', sortable: true },
    { key: 'price' as const, label: 'Price', sortable: true, render: (value: number) => formatPrice(value) },
    { key: 'category' as const, label: 'Category', sortable: true },
    { key: 'status' as const, label: 'Status', render: (value: string) => {
      const statusConfig = {
        active: { variant: 'success' as const, icon: CheckCircle },
        sold: { variant: 'default' as const, icon: CheckCircle },
        removed: { variant: 'destructive' as const, icon: XCircle },
        flagged: { variant: 'destructive' as const, icon: AlertTriangle },
      };
      const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.active;
      const Icon = config.icon;
      return (
        <Badge variant={config.variant} className="flex items-center gap-1">
          <Icon className="w-3 h-3" />
          {value}
        </Badge>
      );
    }},
    { key: 'date' as const, label: 'Date', sortable: true },
  ];

  const handleApprove = async (id: string) => {
    await supabase.from('listings').update({ status: 'active' }).eq('id', id);
    fetchListings();
  };

  const handleRemove = async (id: string) => {
    await supabase.from('listings').update({ status: 'removed' }).eq('id', id);
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Listings Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage all marketplace listings</p>
              </div>
            </div>
            <Button>
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Filter Tabs */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
          >
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'active', 'sold', 'removed', 'flagged'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {allListings.filter((l) => l.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Listings Table */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <AdminTable
              data={filteredListings}
              columns={columns}
              actions={(item) => (
                <div className="flex gap-2">
                  <Link href={`/listings/${item.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  {item.status === 'flagged' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(item.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemove(item.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              )}
              searchable
              filterable
            />
          </motion.div>
        )}

        {/* Bulk Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredListings.length} listings selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Bulk Approve
              </Button>
              <Button variant="destructive" size="sm">
                Bulk Remove
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
