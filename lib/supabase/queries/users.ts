import { createClient } from '../client';
import type { User } from '@/types';

export async function getCurrentUser() {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) throw error;
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;
  
  return { ...user, ...profile } as User;
}

export async function getUserById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as User;
}

export async function updateProfile(id: string, updates: Partial<User>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

export async function uploadAvatar(userId: string, file: File) {
  const supabase = createClient();
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  // Update profile with new avatar URL
  await updateProfile(userId, { avatar: publicUrl });
  
  return publicUrl;
}

export async function getUserListings(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      images:listing_images(*),
      category:categories(*)
    `)
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUserReviews(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles(*),
      listing:listings(*)
    `)
    .eq('reviewed_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUserStats(userId: string) {
  const supabase = createClient();
  
  const [listingsResult, reviewsResult] = await Promise.all([
    supabase.from('listings').select('id, status, view_count').eq('seller_id', userId),
    supabase.from('reviews').select('rating').eq('reviewed_id', userId)
  ]);

  if (listingsResult.error) throw listingsResult.error;
  if (reviewsResult.error) throw reviewsResult.error;

  const listings = listingsResult.data || [];
  const reviews = reviewsResult.data || [];

  const totalListings = listings.length;
  const activeListings = listings.filter(l => l.status === 'active').length;
  const soldListings = listings.filter(l => l.status === 'sold').length;
  const totalViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0);
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  return {
    totalListings,
    activeListings,
    soldListings,
    totalViews,
    averageRating,
    totalReviews: reviews.length
  };
}
