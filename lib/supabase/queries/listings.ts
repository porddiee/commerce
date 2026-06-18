import { createClient } from '../client';
import type { Listing } from '@/types';

export async function getListings(filters?: {
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();
  
  let query = supabase
    .from('listings')
    .select(`
      *,
      seller:profiles(*),
      images:listing_images(*),
      category:categories(*)
    `);

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.condition) {
    query = query.eq('condition', filters.condition);
  }
  if (filters?.minPrice) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  
  if (error) throw error;
  return data as Listing[];
}

export async function getListingById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles(*),
      images:listing_images(*),
      category:categories(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Listing;
}

export async function createListing(listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('listings')
    .insert(listing)
    .select()
    .single();

  if (error) throw error;
  return data as Listing;
}

export async function updateListing(id: string, updates: Partial<Listing>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('listings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Listing;
}

export async function deleteListing(id: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function incrementListingViews(id: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .rpc('increment_view_count', { listing_id: id });

  if (error) throw error;
}

export async function searchListings(query: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles(*),
      images:listing_images(*),
      category:categories(*)
    `)
    .textSearch('title', query)
    .or(`description.ilike.%${query}%`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data as Listing[];
}

export async function getListingsWithinRadius(lat: number, lng: number, radiusKm: number) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .rpc('get_listings_within_radius', {
      lat,
      lng,
      radius_km: radiusKm
    });

  if (error) throw error;
  return data as Listing[];
}
