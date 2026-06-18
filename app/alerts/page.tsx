'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, X, Search, MapPin, DollarSign, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AlertsPage() {
  const supabase = createClient();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'price' as 'price' | 'item' | 'category',
    targetPrice: '',
    keywords: '',
    category: '',
    radius: 5,
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    setAlerts(data || []);
    setLoading(false);
  };

  const handleAddAlert = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('alerts').insert({
      user_id: user.id,
      type: newAlert.type,
      target_price: newAlert.targetPrice ? parseFloat(newAlert.targetPrice) : null,
      keywords: newAlert.keywords || null,
      category: newAlert.category || null,
      radius: newAlert.radius,
      is_active: true,
    });

    if (!error) {
      toast.success('Alert created successfully!');
      fetchAlerts();
      setNewAlert({ type: 'price', targetPrice: '', keywords: '', category: '', radius: 5 });
      setShowAddModal(false);
    } else {
      toast.error('Failed to create alert');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    await supabase.from('alerts').delete().eq('id', id);
    toast.success('Alert deleted');
    fetchAlerts();
  };

  const handleToggleAlert = async (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (alert) {
      await supabase.from('alerts').update({ is_active: !alert.is_active }).eq('id', id);
      toast.success(alert.is_active ? 'Alert paused' : 'Alert activated');
      fetchAlerts();
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price':
        return DollarSign;
      case 'item':
        return Search;
      case 'category':
        return Plus;
      default:
        return Bell;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habol Alerts</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when items match your criteria</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Alert
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
          <>
            {/* Active Alerts */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Active Alerts ({alerts.filter((a) => a.is_active).length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alerts
                  .filter((a) => a.is_active)
                  .map((alert) => {
                    const Icon = getAlertIcon(alert.type);
                    return (
                      <Card key={alert.id} className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center">
                                <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {alert.type === 'price' ? `Price Alert: ₱${alert.target_price?.toLocaleString()}` : 
                                   alert.type === 'item' ? `Item: ${alert.keywords}` :
                                   `Category: ${alert.category}`}
                                </p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {alert.type}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleAlert(alert.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            {alert.type === 'price' && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <DollarSign className="w-4 h-4" />
                                <span>Target: ₱{alert.target_price?.toLocaleString()}</span>
                              </div>
                            )}
                            {alert.type === 'item' && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Search className="w-4 h-4" />
                                <span>{alert.keywords}</span>
                              </div>
                            )}
                            {alert.type === 'category' && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Plus className="w-4 h-4" />
                                <span>{alert.category}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4" />
                              <span>Within {alert.radius}km</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {alert.matches || 0} matches found
                              </span>
                            </div>
                            <Button variant="outline" size="sm">
                              View Matches
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>

            {/* Inactive Alerts */}
            {alerts.filter((a) => !a.is_active).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Paused Alerts ({alerts.filter((a) => !a.is_active).length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alerts
                    .filter((a) => !a.is_active)
                    .map((alert) => {
                      const Icon = getAlertIcon(alert.type);
                      return (
                        <Card key={alert.id} className="border-gray-200 dark:border-gray-700 opacity-60">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {alert.type === 'price' ? `Price Alert: ₱${alert.target_price?.toLocaleString()}` : 
                                     alert.type === 'item' ? `Item: ${alert.keywords}` :
                                     `Category: ${alert.category}`}
                                  </p>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {alert.type}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleAlert(alert.id)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAlert(alert.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Add Alert Modal */}
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Create New Alert
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alert Type
                  </label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="price">Price Watch</option>
                    <option value="item">Item Match</option>
                    <option value="category">Category</option>
                  </select>
                </div>

                {newAlert.type === 'price' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Price (₱)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter target price"
                      value={newAlert.targetPrice}
                      onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                    />
                  </div>
                )}

                {newAlert.type === 'item' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Keywords
                    </label>
                    <Input
                      placeholder="e.g., iPhone 14, gaming laptop"
                      value={newAlert.keywords}
                      onChange={(e) => setNewAlert({ ...newAlert, keywords: e.target.value })}
                    />
                  </div>
                )}

                {newAlert.type === 'category' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newAlert.category}
                      onChange={(e) => setNewAlert({ ...newAlert, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
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
                      value={newAlert.radius}
                      onChange={(e) => setNewAlert({ ...newAlert, radius: Number(e.target.value) })}
                      className="flex-1 accent-brand-500"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-16">
                      {newAlert.radius}km
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddAlert} className="flex-1">
                  <Bell className="w-4 h-4 mr-2" />
                  Create Alert
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
