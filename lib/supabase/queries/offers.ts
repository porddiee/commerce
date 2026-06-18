import { createClient } from '../client';
import type { Offer } from '@/types';

export async function getOffers(listingId?: string, userId?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from('offers')
    .select(`
      *,
      listing:listings(*),
      buyer:profiles(*),
      seller:profiles(*)
    `);

  if (listingId) {
    query = query.eq('listing_id', listingId);
  }
  if (userId) {
    query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  
  if (error) throw error;
  return data as Offer[];
}

export async function getOfferById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      listing:listings(*),
      buyer:profiles(*),
      seller:profiles(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Offer;
}

export async function createOffer(offer: Omit<Offer, 'id' | 'createdAt'>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('offers')
    .insert(offer)
    .select()
    .single();

  if (error) throw error;
  return data as Offer;
}

export async function updateOfferStatus(id: string, status: 'accepted' | 'rejected' | 'countered', counterAmount?: number) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('offers')
    .update({ 
      status,
      counter_amount: counterAmount
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Offer;
}

export async function getListingOffers(listingId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      buyer:profiles(*)
    `)
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Offer[];
}

// Realtime subscription for offers
export function subscribeToOffers(listingId: string, callback: (offer: Offer) => void) {
  const supabase = createClient();
  
  const channel = supabase
    .channel(`offers:${listingId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'offers',
        filter: `listing_id=eq.${listingId}`
      },
      (payload) => callback(payload.new as Offer)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
