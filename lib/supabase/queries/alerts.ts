import { createClient } from '../client';
import type { HabolAlert } from '@/types';

export async function getAlerts(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('habol_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as HabolAlert[];
}

export async function getAlertById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('habol_alerts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as HabolAlert;
}

export async function createAlert(alert: Omit<HabolAlert, 'id' | 'createdAt'>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('habol_alerts')
    .insert(alert)
    .select()
    .single();

  if (error) throw error;
  return data as HabolAlert;
}

export async function updateAlert(id: string, updates: Partial<HabolAlert>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('habol_alerts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as HabolAlert;
}

export async function deleteAlert(id: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('habol_alerts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleAlertActive(id: string, isActive: boolean) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('habol_alerts')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as HabolAlert;
}

export async function checkAlertMatches(alertId: string) {
  const supabase = createClient();
  
  // This would typically be called by a background job or webhook
  // For now, it's a placeholder for the matching logic
  const { data: alert } = await supabase
    .from('habol_alerts')
    .select('*')
    .eq('id', alertId)
    .single();

  if (!alert) return [];

  // Build query based on alert type
  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active');

  if (alert.max_price) {
    query = query.lte('price', alert.max_price);
  }

  if (alert.keyword) {
    query = query.or(`title.ilike.%${alert.keyword}%,description.ilike.%${alert.keyword}%`);
  }

  if (alert.category_id) {
    query = query.eq('category_id', alert.category_id);
  }

  // If location is set, use PostGIS radius search
  if (alert.location && alert.radius_km) {
    // This would use the get_listings_within_radius function
    // For now, we'll skip this complex query
  }

  const { data, error } = await query.limit(20);
  
  if (error) throw error;
  return data;
}
