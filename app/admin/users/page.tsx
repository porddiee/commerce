'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Ban, CheckCircle, AlertCircle, UserCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrustBadge } from '@/components/TrustBadge';
import { AdminTable } from '@/components/AdminTable';
import { createClient } from '@/lib/supabase/client';

export default function AdminUsersPage() {
  const supabase = createClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    setAllUsers(data?.map((u: any) => ({
      id: u.id,
      name: u.full_name || 'Unknown',
      email: u.email || 'N/A',
      barangay: u.barangay || 'N/A',
      trustScore: u.trust_score || 70,
      verified: u.is_verified || false,
      role: 'user',
      status: 'active',
      joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A',
    })) || []);
    setLoading(false);
  };

  const filteredUsers = statusFilter === 'all'
    ? allUsers
    : allUsers.filter((u) => u.status === statusFilter);

  const columns = [
    { key: 'name' as const, label: 'Name', sortable: true },
    { key: 'email' as const, label: 'Email', sortable: true },
    { key: 'barangay' as const, label: 'Location', sortable: true },
    { key: 'trustScore' as const, label: 'Trust Score', sortable: true, render: (value: number) => (
      <TrustBadge score={value} size="sm" />
    )},
    { key: 'verified' as const, label: 'Verified', render: (value: boolean) => (
      <Badge variant={value ? 'success' : 'outline'}>
        {value ? 'Yes' : 'No'}
      </Badge>
    )},
    { key: 'role' as const, label: 'Role', sortable: true },
    { key: 'status' as const, label: 'Status', render: (value: string) => {
      const statusConfig = {
        active: { variant: 'success' as const, icon: CheckCircle },
        suspended: { variant: 'destructive' as const, icon: Ban },
        banned: { variant: 'destructive' as const, icon: AlertCircle },
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
    { key: 'joined' as const, label: 'Joined', sortable: true },
  ];

  const handleVerify = async (id: string) => {
    await supabase.from('profiles').update({ is_verified: true }).eq('id', id);
    fetchUsers();
  };

  const handleSuspend = async (id: string) => {
    await supabase.from('profiles').update({ status: 'suspended' }).eq('id', id);
    fetchUsers();
  };

  const handleBan = async (id: string) => {
    await supabase.from('profiles').update({ status: 'banned' }).eq('id', id);
    fetchUsers();
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage all marketplace users</p>
              </div>
            </div>
            <Button>
              <UserCheck className="w-4 h-4 mr-2" />
              Add User
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
              {['all', 'active', 'suspended', 'banned'].map((status) => (
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
                      {allUsers.filter((u) => u.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Users Table */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <AdminTable
              data={filteredUsers}
              columns={columns}
              actions={(item) => (
                <div className="flex gap-2">
                  <Link href={`/profile/${item.id}`}>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                  {!item.verified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerify(item.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verify
                    </Button>
                  )}
                  {item.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuspend(item.id)}
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      Suspend
                    </Button>
                  )}
                  {item.status === 'suspended' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerify(item.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Reinstate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBan(item.id)}
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Ban
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

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{allUsers.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Verified Users</p>
            <p className="text-3xl font-bold text-green-600">{allUsers.filter(u => u.verified).length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Suspended/Banned</p>
            <p className="text-3xl font-bold text-red-600">{allUsers.filter(u => u.status !== 'active').length}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
