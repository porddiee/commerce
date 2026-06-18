'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, MoreVertical, Phone, MapPin, Handshake, X, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrustBadge } from '@/components/TrustBadge';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

export default function MessagesPage() {
  const supabase = createClient();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  let realtimeChannel: RealtimeChannel | null = null;

  useEffect(() => {
    fetchCurrentUser();
    fetchConversations();

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      subscribeToMessages(selectedConversation.id);
    }

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [selectedConversation]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:profiles!conversations_user1_id_fkey(*),
        user2:profiles!conversations_user2_id_fkey(*),
        listing:listings(*),
        messages(*)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    setConversations(data || []);
    if (data && data.length > 0 && !selectedConversation) {
      setSelectedConversation(data[0]);
    }
    setLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const subscribeToMessages = (conversationId: string) => {
    realtimeChannel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversation && currentUser) {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation.id,
        sender_id: currentUser.id,
        content: newMessage,
      });

      if (!error) {
        setNewMessage('');
      } else {
        toast.error('Failed to send message');
      }
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.user1?.id === currentUser?.id ? conv.user2 : conv.user1;
    return otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-[calc(100vh-180px)]">
          <div className="flex h-full">
            {/* Conversation List */}
            <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => {
                    const otherUser = conversation.user1?.id === currentUser?.id ? conversation.user2 : conversation.user1;
                    const lastMessage = conversation.messages?.[conversation.messages.length - 1];
                    return (
                      <motion.button
                        key={conversation.id}
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-700 transition-colors ${
                          selectedConversation?.id === conversation.id
                            ? 'bg-brand-50 dark:bg-brand-900/20 border-l-4 border-l-brand-500'
                            : 'border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                              <span className="text-brand-600 dark:text-brand-400 font-semibold">
                                {otherUser?.full_name?.charAt(0) || '?'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-gray-900 dark:text-white truncate">
                                {otherUser?.full_name || 'Unknown'}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(conversation.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {lastMessage?.content || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 py-8">No conversations yet</p>
                )}
              </div>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
              <div className="hidden md:flex flex-1 flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                        <span className="text-brand-600 dark:text-brand-400 font-semibold">
                          {selectedConversation.user1?.id === currentUser?.id
                            ? selectedConversation.user2?.full_name?.charAt(0) || '?'
                            : selectedConversation.user1?.full_name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedConversation.user1?.id === currentUser?.id
                            ? selectedConversation.user2?.full_name || 'Unknown'
                            : selectedConversation.user1?.full_name || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-2">
                          <TrustBadge score={70} size="sm" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedConversation.user1?.id === currentUser?.id
                              ? selectedConversation.user2?.barangay || 'Philippines'
                              : selectedConversation.user1?.barangay || 'Philippines'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Listing Context */}
                {selectedConversation.listing && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                        {selectedConversation.listing.images?.[0] && (
                          <Image
                            src={selectedConversation.listing.images[0].url}
                            alt={selectedConversation.listing.title}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {selectedConversation.listing.title}
                        </p>
                        <p className="text-brand-500 font-semibold">{formatPrice(selectedConversation.listing.price)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {selectedConversation.listing.barangay || 'Philippines'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.sender_id === currentUser?.id
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="sm">
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
