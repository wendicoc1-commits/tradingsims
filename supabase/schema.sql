-- ==============================================================================
-- TRADINGSIMS DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Tabel Member, Autentikasi, Portofolio Saham & Crypto, Orders, dan Top-Up
-- ==============================================================================

-- 1. TABEL PROFIL MEMBER
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  full_name text,
  avatar_url text,
  auth_provider text default 'email',
  role text default 'member', -- 'member' | 'admin'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TABEL PORTOFOLIO KAS MEMBER
create table if not exists public.portfolios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  cash numeric default 100000000 not null, -- Default modal awal Rp 100 Juta
  realized_pl numeric default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TABEL KEPEMILIKAN POSISI (HOLDINGS)
create table if not exists public.holdings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  symbol text not null,
  display_symbol text not null,
  name text not null,
  avg_price numeric not null,
  lots integer default 0,
  shares numeric default 0,
  crypto_units numeric,
  asset_class text default 'EQUITY', -- 'EQUITY' | 'CRYPTO'
  currency text default 'IDR',
  exchange_rate numeric default 16000,
  take_profit_price numeric,
  stop_loss_price numeric,
  validity_type text default 'GTC',
  total_dividend_earned numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, symbol)
);

-- 4. TABEL RIWAYAT TRANSAKSI (ORDERS)
create table if not exists public.orders (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  symbol text not null,
  display_symbol text not null,
  type text not null, -- 'BUY' | 'SELL'
  order_type text default 'LIMIT', -- 'LIMIT' | 'MARKET'
  price numeric not null,
  lots integer not null,
  shares numeric not null,
  total numeric not null,
  fee numeric default 0,
  broker_fee numeric default 0,
  tax_fee numeric default 0,
  status text default 'FILLED', -- 'PENDING' | 'FILLED' | 'CANCELLED'
  realized_pl numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  filled_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. TABEL TIKET TOP-UP QRIS MEMBER (METODE A)
create table if not exists public.topup_requests (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  sender_name text not null,
  sender_bank text not null,
  nominal_idr numeric not null,
  virtual_cash numeric not null,
  ref_note text,
  proof_image_url text,
  status text default 'PENDING', -- 'PENDING' | 'APPROVED' | 'REJECTED'
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  approved_at timestamp with time zone
);

-- 6. TABEL WATCHLISTS & WATCHLIST ITEMS
create table if not exists public.watchlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null default 'Daftar Pantau Utama',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.watchlist_items (
  id uuid default gen_random_uuid() primary key,
  watchlist_id uuid references public.watchlists(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  symbol text not null,
  display_symbol text not null,
  name text,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (watchlist_id, symbol)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - Keamanan Data Member
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.holdings enable row level security;
alter table public.orders enable row level security;
alter table public.topup_requests enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_items enable row level security;

-- Policy Profiles
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Policy Portfolios
create policy "Users can view their own portfolio" on public.portfolios
  for select using (auth.uid() = user_id);
create policy "Users can update their own portfolio" on public.portfolios
  for update using (auth.uid() = user_id);
create policy "Users can insert their own portfolio" on public.portfolios
  for insert with check (auth.uid() = user_id);

-- Policy Holdings
create policy "Users can view their own holdings" on public.holdings
  for select using (auth.uid() = user_id);
create policy "Users can insert/update their own holdings" on public.holdings
  for all using (auth.uid() = user_id);

-- Policy Orders
create policy "Users can view their own orders" on public.orders
  for select using (auth.uid() = user_id);
create policy "Users can insert their own orders" on public.orders
  for insert with check (auth.uid() = user_id);

-- Policy Watchlists
create policy "Users can view their own watchlists" on public.watchlists
  for select using (auth.uid() = user_id);
create policy "Users can manage their own watchlists" on public.watchlists
  for all using (auth.uid() = user_id);

-- Policy Watchlist Items
create policy "Users can view their own watchlist items" on public.watchlist_items
  for select using (auth.uid() = user_id);
create policy "Users can manage their own watchlist items" on public.watchlist_items
  for all using (auth.uid() = user_id);

-- Policy Topup Requests
create policy "Users can view their own topups" on public.topup_requests
  for select using (auth.uid() = user_id);
create policy "Users can insert their own topups" on public.topup_requests
  for insert with check (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC TRIGGER: Inisialisasi Akun & Modal Rp 100 Juta saat User Mendaftar
-- Mendukung pendaftaran via Email, Apple ID, Facebook, dan Google
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- 1. Insert ke tabel profiles
  insert into public.profiles (id, email, full_name, avatar_url, auth_provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null),
    coalesce(new.raw_app_meta_data->>'provider', 'email')
  );

  -- 2. Berikan modal awal Kas RDN Simulasi Rp 100.000.000
  insert into public.portfolios (user_id, cash, realized_pl)
  values (new.id, 100000000, 0);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger pada event Supabase Auth
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
