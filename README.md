# Habol - Philippine Marketplace

A hyper-local peer-to-peer marketplace for the Philippines built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- **User Authentication**: Email/password and Google OAuth via Supabase
- **Listings**: Create, browse, search, and filter listings
- **Real-time Messaging**: Chat with buyers/sellers with Supabase Realtime
- **Admin Dashboard**: Manage users, listings, and meet-safe zones
- **Alerts**: Set up price/item/category alerts
- **Payment Integration**: PayMongo payment processing
- **Trust System**: Barangay Trust Score and verified meet-safe zones

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **UI Components**: shadcn/ui, Framer Motion, Lucide Icons
- **Payments**: PayMongo
- **Maps**: Mapbox GL (pending integration)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- PayMongo account (for payments)
- Mapbox account (optional, for maps)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd COMMERCE2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PayMongo (optional, for payments)
PAYMONGO_SECRET_KEY=your_paymongo_secret_key
PAYMONGO_WEBHOOK_SECRET=your_paymongo_webhook_secret

# Mapbox (optional, for maps)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

5. Run Supabase migrations:
```bash
npx supabase db push
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration files in `supabase/migrations/`:
   - `001_initial_schema.sql` - Database schema
   - `002_rls_policies.sql` - Row Level Security policies
   - `003_profile_trigger.sql` - Auto-create profile on signup
   - `004_storage_buckets.sql` - Storage buckets for images

3. Create storage buckets:
   - `listing-images` - For listing photos
   - `avatars` - For user profile pictures

4. Enable Row Level Security on all tables

## PayMongo Setup (Optional)

1. Create an account at [paymongo.com](https://paymongo.com)
2. Get your API keys from the dashboard
3. Add the webhook URL: `https://your-domain.com/api/paymongo/webhook`
4. Configure webhook events: `payment.paid`

## Mapbox Setup (Optional)

**Note**: Mapbox requires a credit card for account creation. If you don't have a bank card, you can use free alternatives like:

- **Leaflet + OpenStreetMap**: Completely free, no credit card required
- **Google Maps**: Free tier available with some limitations

To use Leaflet with OpenStreetMap (recommended free alternative):

1. Install leaflet and react-leaflet:
```bash
npm install leaflet react-leaflet
```

2. No API key required - OpenStreetMap is free and open source

3. Add to your components as needed

If you want to use Mapbox later when you have a bank card:

1. Create an account at [mapbox.com](https://mapbox.com)
2. Get your access token from the dashboard
3. Add to environment variables

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Add these to your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYMONGO_SECRET_KEY` (optional)
- `PAYMONGO_WEBHOOK_SECRET` (optional)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (optional)

### Configure Supabase OAuth Redirect URLs

1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add your production URL to:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/callback`

## Project Structure

```
COMMERCE2/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages
│   ├── alerts/            # Alerts page
│   ├── api/               # API routes
│   │   └── paymongo/     # PayMongo webhooks
│   ├── dashboard/         # User dashboard
│   ├── listings/          # Listings pages
│   ├── login/             # Login page
│   ├── messages/          # Messages page
│   ├── profile/           # Profile pages
│   ├── register/          # Registration page
│   └── search/            # Search page
├── components/            # React components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client
│   │   ├── client.ts     # Browser client
│   │   ├── server.ts     # Server client
│   │   └── queries/      # Supabase queries
├── supabase/              # Supabase migrations
└── types/                 # TypeScript types
```

## Completed Features

- ✅ Supabase authentication (email/password, Google OAuth)
- ✅ User profiles with avatars
- ✅ Listings with image uploads
- ✅ Real-time messaging
- ✅ Admin dashboard
- ✅ User management (verify, suspend, ban)
- ✅ Listing management (approve, remove)
- ✅ Meet-safe zones management
- ✅ Alerts system
- ✅ Toast notifications
- ✅ PayMongo payment API endpoints
- ✅ Row Level Security

## Pending Features

- ⏳ Mapbox integration (clustered pins, barangay maps, location picker)
- ⏳ Meet-safe zone green pins on maps
- ⏳ Production deployment
- ⏳ OAuth redirect URL configuration
- ⏳ End-to-end testing

## License

MIT
