'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Shield, User, Chrome, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loginType, setLoginType] = useState<'buyer-seller' | 'admin'>('buyer-seller');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is admin for admin login
      if (loginType === 'admin') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, is_suspended')
          .eq('id', data.user.id)
          .single();

        if (!profile?.is_admin) {
          throw new Error('You do not have admin access');
        }

        if (profile.is_suspended) {
          throw new Error('Your account has been suspended');
        }

        toast.success('Welcome back, Admin!');
        router.push('/admin');
      } else {
        // Check if user is suspended
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_suspended')
          .eq('id', data.user.id)
          .single();

        if (profile?.is_suspended) {
          throw new Error('Your account has been suspended');
        }

        toast.success('Welcome back!');
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Facebook login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-brand-500">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Buyer/Seller Login Portal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 transition-all ${
              loginType === 'buyer-seller'
                ? 'border-brand-500 ring-4 ring-brand-500/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Buyer / Seller Login
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Access your marketplace account
                  </p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <input type="checkbox" className="rounded border-gray-300 text-brand-500" />
                    Remember me
                  </label>
                  <a href="#" className="text-brand-500 hover:text-brand-600">
                    Forgot password?
                  </a>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
                    <Chrome className="w-5 h-5 mr-2" />
                    Google
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={handleFacebookLogin} disabled={loading}>
                    <span className="text-blue-600 font-bold mr-2">f</span>
                    Facebook
                  </Button>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </form>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-brand-500 hover:text-brand-600 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Admin Login Portal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-gray-900 dark:bg-gray-950 rounded-2xl shadow-xl overflow-hidden border-2 transition-all ${
              loginType === 'admin'
                ? 'border-brand-500 ring-4 ring-brand-500/20'
                : 'border-gray-700'
            }`}
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Admin Login</h2>
                  <p className="text-gray-400 text-sm">
                    Restricted access for administrators
                  </p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="email"
                      placeholder="admin@habol.ph"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-400">
                    <input type="checkbox" className="rounded border-gray-600 bg-gray-800 text-brand-500" />
                    Remember me
                  </label>
                  <a href="#" className="text-brand-400 hover:text-brand-300">
                    Forgot password?
                  </a>
                </div>

                <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                  {loading ? 'Authenticating...' : 'Access Admin Panel'}
                </Button>

                {error && (
                  <div className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mt-4">
                  <p className="text-red-300 text-sm">
                    <strong>⚠️ Warning:</strong> Unauthorized access to this portal is
                    monitored and will be reported.
                  </p>
                </div>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                Need admin access?{' '}
                <a href="#" className="text-brand-400 hover:text-brand-300 font-medium">
                  Contact IT Support
                </a>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Portal Selector */}
        <div className="mt-8 flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setLoginType('buyer-seller')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                loginType === 'buyer-seller'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Buyer / Seller
            </button>
            <button
              onClick={() => setLoginType('admin')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                loginType === 'admin'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
