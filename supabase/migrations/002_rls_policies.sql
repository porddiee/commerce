-- Enable Row Level Security on all tables
alter table profiles enable row level security;
alter table listings enable row level security;
alter table listing_images enable row level security;
alter table habol_alerts enable row level security;
alter table meet_safe_zones enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table offers enable row level security;
alter table reviews enable row level security;
alter table transactions enable row level security;
alter table reports enable row level security;
alter table listing_bundles enable row level security;

-- Profiles policies
-- Authenticated users can read all profiles
create policy "Profiles: Select all for authenticated"
  on profiles for select
  to authenticated
  using (true);

-- Users can update only their own profile
create policy "Profiles: Update own"
  on profiles for update
  to authenticated
  using (id = auth.uid());

-- Listings policies
-- Anyone can read active listings
create policy "Listings: Select active for public"
  on listings for select
  to public
  using (status = 'active');

-- Authenticated users can read all listings
create policy "Listings: Select all for authenticated"
  on listings for select
  to authenticated
  using (true);

-- Authenticated non-suspended users can insert
create policy "Listings: Insert for authenticated non-suspended"
  on listings for insert
  to authenticated
  with check (
    seller_id = auth.uid()
    and not exists (
      select 1 from profiles 
      where id = auth.uid() and is_suspended = true
    )
  );

-- Only seller_id can update
create policy "Listings: Update own"
  on listings for update
  to authenticated
  using (seller_id = auth.uid());

-- Only seller_id or admin can delete
create policy "Listings: Delete own or admin"
  on listings for delete
  to authenticated
  using (
    seller_id = auth.uid()
    or exists (
      select 1 from profiles 
      where id = auth.uid() and is_admin = true
    )
  );

-- Listing images policies
-- Public can read images for active listings
create policy "Listing images: Select for public"
  on listing_images for select
  to public
  using (
    exists (
      select 1 from listings 
      where listings.id = listing_images.listing_id 
      and listings.status = 'active'
    )
  );

-- Authenticated can read all images
create policy "Listing images: Select for authenticated"
  on listing_images for select
  to authenticated
  using (true);

-- Only listing seller can insert images
create policy "Listing images: Insert for seller"
  on listing_images for insert
  to authenticated
  with check (
    exists (
      select 1 from listings 
      where listings.id = listing_images.listing_id 
      and listings.seller_id = auth.uid()
    )
  );

-- Only listing seller can update images
create policy "Listing images: Update for seller"
  on listing_images for update
  to authenticated
  using (
    exists (
      select 1 from listings 
      where listings.id = listing_images.listing_id 
      and listings.seller_id = auth.uid()
    )
  );

-- Only listing seller can delete images
create policy "Listing images: Delete for seller"
  on listing_images for delete
  to authenticated
  using (
    exists (
      select 1 from listings 
      where listings.id = listing_images.listing_id 
      and listings.seller_id = auth.uid()
    )
  );

-- Habol alerts policies
-- All operations only for user_id = auth.uid()
create policy "Habol alerts: Select own"
  on habol_alerts for select
  to authenticated
  using (user_id = auth.uid());

create policy "Habol alerts: Insert own"
  on habol_alerts for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Habol alerts: Update own"
  on habol_alerts for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Habol alerts: Delete own"
  on habol_alerts for delete
  to authenticated
  using (user_id = auth.uid());

-- Meet safe zones policies
-- Anyone can read
create policy "Meet safe zones: Select for public"
  on meet_safe_zones for select
  to public
  using (is_active = true);

create policy "Meet safe zones: Select all for authenticated"
  on meet_safe_zones for select
  to authenticated
  using (true);

-- Only admin can insert
create policy "Meet safe zones: Insert for admin"
  on meet_safe_zones for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles 
      where id = auth.uid() and is_admin = true
    )
  );

-- Only admin can update
create policy "Meet safe zones: Update for admin"
  on meet_safe_zones for update
  to authenticated
  using (
    exists (
      select 1 from profiles 
      where id = auth.uid() and is_admin = true
    )
  );

-- Only admin can delete
create policy "Meet safe zones: Delete for admin"
  on meet_safe_zones for delete
  to authenticated
  using (
    exists (
      select 1 from profiles 
      where id = auth.uid() and is_admin = true
    )
  );

-- Conversations policies
-- Only buyer or seller can select
create policy "Conversations: Select own"
  on conversations for select
  to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

-- Only buyer or seller can insert
create policy "Conversations: Insert own"
  on conversations for insert
  to authenticated
  with check (buyer_id = auth.uid() or seller_id = auth.uid());

-- Messages policies
-- Only conversation participants can select
create policy "Messages: Select own conversations"
  on messages for select
  to authenticated
  using (
    exists (
      select 1 from conversations 
      where conversations.id = messages.conversation_id 
      and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
    )
  );

-- Only conversation participants can insert
create policy "Messages: Insert own conversations"
  on messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations 
      where conversations.id = messages.conversation_id 
      and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
    )
  );

-- Only sender can update
create policy "Messages: Update own"
  on messages for update
  to authenticated
  using (sender_id = auth.uid());

-- Offers policies
-- Only buyer or seller can select
create policy "Offers: Select own"
  on offers for select
  to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

-- Authenticated users can insert (not own listing)
create policy "Offers: Insert authenticated"
  on offers for insert
  to authenticated
  with check (
    buyer_id = auth.uid()
    and not exists (
      select 1 from listings 
      where listings.id = offers.listing_id 
      and listings.seller_id = auth.uid()
    )
  );

-- Only seller can update (to accept/reject)
create policy "Offers: Update for seller"
  on offers for update
  to authenticated
  using (seller_id = auth.uid());

-- Reviews policies
-- Anyone can read
create policy "Reviews: Select for public"
  on reviews for select
  to public
  using (true);

-- Authenticated, only after completed transaction
create policy "Reviews: Insert after transaction"
  on reviews for insert
  to authenticated
  with check (
    reviewer_id = auth.uid()
    and exists (
      select 1 from transactions 
      where transactions.listing_id = reviews.listing_id 
      and transactions.buyer_id = auth.uid()
      and transactions.status = 'completed'
    )
  );

-- Transactions policies
-- Only buyer or seller can select
create policy "Transactions: Select own"
  on transactions for select
  to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

-- Only buyer or seller can insert
create policy "Transactions: Insert own"
  on transactions for insert
  to authenticated
  with check (buyer_id = auth.uid() or seller_id = auth.uid());

-- Only buyer or seller can update
create policy "Transactions: Update own"
  on transactions for update
  to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

-- Reports policies
-- Authenticated users can insert
create policy "Reports: Insert authenticated"
  on reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

-- Only admin can select all
create policy "Reports: Select for admin"
  on reports for select
  to authenticated
  using (
    exists (
      select 1 from profiles 
      where id = auth.uid() and is_admin = true
    )
  );

-- Only reporter can select own
create policy "Reports: Select own"
  on reports for select
  to authenticated
  using (reporter_id = auth.uid());

-- Bundle deals policies
-- Public can read bundles for active listings
create policy "Listing bundles: Select for public"
  on listing_bundles for select
  to public
  using (
    exists (
      select 1 from listings 
      where listings.id = listing_bundles.parent_listing_id 
      and listings.status = 'active'
    )
  );

-- Authenticated can read all bundles
create policy "Listing bundles: Select for authenticated"
  on listing_bundles for select
  to authenticated
  using (true);

-- Only listing seller can insert bundles
create policy "Listing bundles: Insert for seller"
  on listing_bundles for insert
  to authenticated
  with check (
    exists (
      select 1 from listings 
      where listings.id = listing_bundles.parent_listing_id 
      and listings.seller_id = auth.uid()
    )
  );
