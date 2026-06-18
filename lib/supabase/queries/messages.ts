import { createClient } from '../client';
import type { Message, MessageContent } from '@/types';

export async function getConversations(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      listing:listings(*, seller:profiles(*)),
      buyer:profiles(*),
      seller:profiles(*),
      messages(messages)
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Message[];
}

export async function getConversationById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      listing:listings(*, seller:profiles(*)),
      buyer:profiles(*),
      seller:profiles(*),
      messages(messages)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Message;
}

export async function getMessages(conversationId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as MessageContent[];
}

export async function sendMessage(conversationId: string, senderId: string, content: string, offerAmount?: number) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      offer_amount: offerAmount
    })
    .select()
    .single();

  if (error) throw error;
  return data as MessageContent;
}

export async function createConversation(listingId: string, buyerId: string, sellerId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId);

  if (error) throw error;
}

export async function getUnreadCount(userId: string) {
  const supabase = createClient();
  
  // First get user's conversation IDs
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  if (convError) throw convError;
  
  const conversationIds = conversations?.map(c => c.id) || [];
  
  if (conversationIds.length === 0) return 0;

  // Then get unread message count
  const { data, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact' })
    .eq('is_read', false)
    .neq('sender_id', userId)
    .in('conversation_id', conversationIds);

  if (error) throw error;
  return data?.length || 0;
}

// Realtime subscription for messages
export function subscribeToMessages(conversationId: string, callback: (message: MessageContent) => void) {
  const supabase = createClient();
  
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => callback(payload.new as MessageContent)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
