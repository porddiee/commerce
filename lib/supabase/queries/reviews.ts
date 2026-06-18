import { createClient } from '../client';
import type { Review } from '@/types';

export async function getReviews(listingId?: string, userId?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles(*),
      reviewed:profiles(*),
      listing:listings(*)
    `);

  if (listingId) {
    query = query.eq('listing_id', listingId);
  }
  if (userId) {
    query = query.eq('reviewed_id', userId);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  
  if (error) throw error;
  return data as Review[];
}

export async function getReviewById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles(*),
      reviewed:profiles(*),
      listing:listings(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Review;
}

export async function createReview(review: Omit<Review, 'id' | 'createdAt'>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

export async function getUserAverageRating(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewed_id', userId);

  if (error) throw error;
  
  if (!data || data.length === 0) return 0;
  
  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return sum / data.length;
}

export async function hasReviewed(listingId: string, reviewerId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('listing_id', listingId)
    .eq('reviewer_id', reviewerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return false; // No rows returned
    throw error;
  }
  
  return !!data;
}
