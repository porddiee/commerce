export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  barangay: string;
  trustScore: number;
  verified: boolean;
  phone?: string;
  role: 'buyer' | 'seller' | 'admin';
  createdAt: Date;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  category: string;
  images: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
    barangay: string;
  };
  seller: User;
  meetSafeZone?: MeetSafeZone;
  isBundle: boolean;
  isLive: boolean;
  views: number;
  offers: number;
  status: 'active' | 'sold' | 'removed' | 'flagged';
  createdAt: Date;
  aiConditionCheck?: boolean;
}

export interface MeetSafeZone {
  id: string;
  name: string;
  type: 'mall' | 'police' | 'convenience-store' | 'other';
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  verified: boolean;
}

export interface Message {
  id: string;
  listingId: string;
  listing: Listing;
  participants: User[];
  messages: MessageContent[];
  unreadCount: number;
  lastMessageAt: Date;
  offer?: Offer;
}

export interface MessageContent {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'offer' | 'system';
}

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  createdAt: Date;
}

export interface HabolAlert {
  id: string;
  userId: string;
  listingId?: string;
  targetPrice?: number;
  keywords?: string[];
  category?: string;
  radius: number;
  location: {
    lat: number;
    lng: number;
  };
  active: boolean;
  createdAt: Date;
}

export interface Review {
  id: string;
  listingId: string;
  reviewerId: string;
  reviewer: User;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalOffers: number;
  revenue: number;
  recentMessages: Message[];
}
