'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Plus, Edit, Trash2, ShoppingBag, Building2, Store, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MeetSafePin } from '@/components/MeetSafePin';
import { createClient } from '@/lib/supabase/client';

export default function AdminMeetSafeZonesPage() {
  const supabase = createClient();
  const [zones, setZones] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newZone, setNewZone] = useState({
    name: '',
    type: 'mall' as 'mall' | 'police' | 'convenience-store' | 'other',
    address: '',
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    const { data } = await supabase.from('meet_safe_zones').select('*').order('name');
    setZones(data || []);
    setLoading(false);
  };

  const handleAddZone = async () => {
    if (newZone.name && newZone.address) {
      const { error } = await supabase.from('meet_safe_zones').insert({
        name: newZone.name,
        type: newZone.type,
        address: newZone.address,
        location: { lat: 14.5995 + Math.random() * 0.01, lng: 120.9842 + Math.random() * 0.01 },
        is_verified: true,
      });
      if (!error) {
        fetchZones();
        setNewZone({ name: '', type: 'mall', address: '' });
        setShowAddModal(false);
      }
    }
  };

  const handleDeleteZone = async (id: string) => {
    await supabase.from('meet_safe_zones').delete().eq('id', id);
    fetchZones();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mall':
        return ShoppingBag;
      case 'police':
        return Building2;
      case 'convenience-store':
        return Store;
      default:
        return MapPin;
    }
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meet-safe Zones</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage verified meetup locations</p>
              </div>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Zone
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Map View</h2>
            </div>
            <div className="h-[500px] bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 relative">
              {/* Mapbox Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Mapbox integration placeholder</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Add your Mapbox access token to enable the map
                  </p>
                </div>
              </div>

              {/* Zone Pins */}
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="absolute"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                >
                  <MeetSafePin zone={zone} showLabel />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Zones List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  All Zones ({zones.length})
                </h2>
                <Badge variant="success">All Verified</Badge>
              </div>

              <div className="space-y-3">
                {zones.map((zone) => {
                  const Icon = getTypeIcon(zone.type);
                  return (
                    <div
                      key={zone.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">{zone.name}</p>
                          {zone.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{zone.address}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {zone.type}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteZone(zone.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Zones</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{zones.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Verified</p>
                <p className="text-2xl font-bold text-green-600">{zones.filter(z => z.verified).length}</p>
              </div>
            </div>
          </motion.div>
        </div>
        )}
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add New Meet-safe Zone
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <Input
                  placeholder="e.g., SM Mall of Asia"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newZone.type}
                  onChange={(e) => setNewZone({ ...newZone, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="mall">Shopping Mall</option>
                  <option value="police">Police Station</option>
                  <option value="convenience-store">Convenience Store</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <Input
                  placeholder="Full address"
                  value={newZone.address}
                  onChange={(e) => setNewZone({ ...newZone, address: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddZone} className="flex-1">
                Add Zone
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
