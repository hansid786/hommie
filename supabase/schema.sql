-- =========================================================
-- DOORSTEP SERVICES STARTUP - COMPLETE SUPABASE SCHEMA (POSTGRESQL)
-- =========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'worker', 'admin');
CREATE TYPE kyc_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE booking_status AS ENUM ('requested', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled', 'disputed');
CREATE TYPE payment_status AS ENUM ('pending', 'escrow_held', 'paid', 'refunded');

-- 3. PROFILES TABLE (Customers, Workers, Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Worker Specific Fields
  trade VARCHAR(100),
  experience_years NUMERIC DEFAULT 0,
  bio TEXT,
  locality VARCHAR(100) DEFAULT 'Gomti Nagar',
  city VARCHAR(100) DEFAULT 'Lucknow',
  base_rate NUMERIC DEFAULT 299,
  is_available BOOLEAN DEFAULT true,
  rating_avg NUMERIC(3, 2) DEFAULT 5.0,
  rating_count INT DEFAULT 0,
  jobs_completed INT DEFAULT 0,
  kyc_status kyc_status DEFAULT 'unverified',
  aadhaar_last_four VARCHAR(4),
  bank_account_number TEXT,
  bank_ifsc VARCHAR(20),
  worker_upi_id VARCHAR(100)
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50) DEFAULT 'Wrench',
  color VARCHAR(50) DEFAULT 'emerald',
  base_price NUMERIC NOT NULL,
  commission_percent NUMERIC DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SAVED ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  label VARCHAR(50) DEFAULT 'Home',
  address_line1 TEXT NOT NULL,
  locality VARCHAR(100) NOT NULL,
  city VARCHAR(100) DEFAULT 'Lucknow',
  postal_code VARCHAR(10) DEFAULT '226010',
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_ref VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  worker_id UUID REFERENCES public.profiles(id) NOT NULL,
  service_category VARCHAR(100) NOT NULL,
  service_title TEXT NOT NULL,
  problem_description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_slot VARCHAR(50) NOT NULL,
  address_text TEXT NOT NULL,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  base_price NUMERIC NOT NULL,
  platform_fee NUMERIC DEFAULT 10,
  safety_fee NUMERIC DEFAULT 10,
  final_amount NUMERIC NOT NULL,
  status booking_status DEFAULT 'requested',
  payment_status payment_status DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'upi',
  payment_id VARCHAR(100),
  cancellation_reason TEXT,
  customer_rating INT,
  customer_review TEXT,
  worker_rating INT,
  worker_review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_role user_role NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. DISPUTES TABLE
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_ref VARCHAR(20) UNIQUE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  raised_by_id UUID REFERENCES public.profiles(id) NOT NULL,
  raised_by_role user_role NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  resolution_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Public catalog access should use a column-safe view in production; direct profile access is restricted.
DROP POLICY IF EXISTS "Public Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public Bookings access for participants" ON public.bookings;
DROP POLICY IF EXISTS "Public Chat Messages access for participants" ON public.chat_messages;

CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Customers can view own bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING ((select auth.uid()) = customer_id);
CREATE POLICY "Workers can view assigned bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING ((select auth.uid()) = worker_id);
CREATE POLICY "Customers can create own bookings"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = customer_id);
CREATE POLICY "Participants can update bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING ((select auth.uid()) = customer_id OR (select auth.uid()) = worker_id)
  WITH CHECK ((select auth.uid()) = customer_id OR (select auth.uid()) = worker_id);

CREATE POLICY "Booking participants can view messages"
  ON public.chat_messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id
      AND ((select auth.uid()) = b.customer_id OR (select auth.uid()) = b.worker_id)
  ));
CREATE POLICY "Booking participants can send messages"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = sender_id AND EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id
      AND ((select auth.uid()) = b.customer_id OR (select auth.uid()) = b.worker_id)
  ));

CREATE POLICY "Users can view own addresses"
  ON public.customer_addresses FOR SELECT TO authenticated
  USING ((select auth.uid()) = customer_id);
CREATE POLICY "Users can manage own addresses"
  ON public.customer_addresses FOR ALL TO authenticated
  USING ((select auth.uid()) = customer_id)
  WITH CHECK ((select auth.uid()) = customer_id);

CREATE POLICY "Participants can view disputes"
  ON public.disputes FOR SELECT TO authenticated
  USING ((select auth.uid()) = raised_by_id OR EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id AND ((select auth.uid()) = b.customer_id OR (select auth.uid()) = b.worker_id)
  ));
CREATE POLICY "Users can raise own disputes"
  ON public.disputes FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = raised_by_id);
