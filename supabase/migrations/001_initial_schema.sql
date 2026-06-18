-- Enable extensions
create extension if not exists postgis;
create extension if not exists pg_trgm;

-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users primary key,
  full_name text not null,
  username text unique,
  avatar_url text,
  phone text,
  barangay text,
  city text,
  province text,
  trust_score int default 50 check (trust_score between 0 and 100),
  is_verified bool default false,
  is_admin bool default false,
  is_suspended bool default false,
  expo_push_token text,
  created_at timestamptz default now()
);

-- Categories
create table categories (
  id serial primary key,
  name text not null,
  slug text unique not null,
  icon_name text,
  parent_id int references categories(id)
);

-- Listings
create table listings (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references profiles not null,
  title text not null,
  description text,
  price numeric(12,2) not null,
  is_negotiable bool default false,
  condition text check (condition in 
    ('new','like_new','good','fair','poor')),
  category_id int references categories,
  status text default 'active' check (status in 
    ('active','sold','removed','flagged')),
  location geography(POINT, 4326),
  location_name text,
  barangay text,
  city text,
  is_bundle bool default false,
  is_live bool default false,
  ai_condition_score numeric(5,2),
  ai_condition_label text,
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Listing images
create table listing_images (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references listings on delete cascade,
  url text not null,
  display_order int default 0,
  is_primary bool default false
);

-- Habol alerts
create table habol_alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles,
  keyword text not null,
  max_price numeric(12,2),
  category_id int references categories,
  radius_km int default 10,
  location geography(POINT, 4326),
  is_active bool default true,
  created_at timestamptz default now()
);

-- Meet safe zones
create table meet_safe_zones (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text check (type in 
    ('mall','police','convenience','school','church')),
  location geography(POINT, 4326) not null,
  address text,
  added_by uuid references profiles,
  is_active bool default true
);

-- Conversations
create table conversations (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references listings,
  buyer_id uuid references profiles,
  seller_id uuid references profiles,
  created_at timestamptz default now(),
  unique(listing_id, buyer_id)
);

-- Messages
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations on delete cascade,
  sender_id uuid references profiles,
  content text,
  offer_amount numeric(12,2),
  is_read bool default false,
  created_at timestamptz default now()
);

-- Offers
create table offers (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references listings,
  buyer_id uuid references profiles,
  seller_id uuid references profiles,
  amount numeric(12,2) not null,
  status text default 'pending' check (status in 
    ('pending','accepted','rejected','countered')),
  counter_amount numeric(12,2),
  created_at timestamptz default now()
);

-- Reviews
create table reviews (
  id uuid default gen_random_uuid() primary key,
  reviewer_id uuid references profiles,
  reviewed_id uuid references profiles,
  listing_id uuid references listings,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique(reviewer_id, listing_id)
);

-- Transactions
create table transactions (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references listings,
  buyer_id uuid references profiles,
  seller_id uuid references profiles,
  amount numeric(12,2) not null,
  payment_method text,
  paymongo_payment_id text,
  status text default 'pending' check (status in 
    ('pending','paid','completed','refunded')),
  created_at timestamptz default now()
);

-- Reports
create table reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references profiles,
  listing_id uuid references listings,
  reported_user_id uuid references profiles,
  reason text not null,
  status text default 'pending' check (status in 
    ('pending','reviewed','resolved')),
  created_at timestamptz default now()
);

-- Bundle deals
create table listing_bundles (
  id uuid default gen_random_uuid() primary key,
  parent_listing_id uuid references listings,
  bundled_listing_id uuid references listings,
  discount_percent numeric(5,2) default 0
);

-- PostGIS radius search function
create or replace function get_listings_within_radius(
  lat float, lng float, radius_km float
)
returns setof listings as $$
  select * from listings
  where status = 'active'
  and ST_DWithin(
    location,
    ST_MakePoint(lng, lat)::geography,
    radius_km * 1000
  )
  order by ST_Distance(
    location, 
    ST_MakePoint(lng, lat)::geography
  );
$$ language sql;
