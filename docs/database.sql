-- ==========================================
-- ECHOCAMPUS FULL DATABASE SCHEMA
-- ==========================================
-- This file contains the complete SQL schema for the EchoCampus database,
-- including table definitions, constraints, indexes, triggers, and RLS policies.
-- Use this to bootstrap a new Supabase project or as a source of truth.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES & CONSTRAINTS
-- ==========================================

-- 1.1 Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Student Profiles
CREATE TABLE public.student_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    session_code TEXT UNIQUE NOT NULL
);

-- 1.3 Faculty Profiles
CREATE TABLE public.faculty_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    department TEXT,
    phone_no TEXT,
    cabin_no TEXT,
    experience_years INTEGER DEFAULT 0 CHECK (experience_years >= 0)
);

-- 1.4 Announcements
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 Complaint Box
CREATE TABLE public.complaint_box (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    urgency TEXT DEFAULT 'LOW',
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 Complaint Upvotes
CREATE TABLE public.complaint_upvotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaint_box(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    UNIQUE (complaint_id, user_id)
);

-- 1.7 Marketplace
CREATE TABLE public.marketplace (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    owner_name TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    product_title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price > 0 AND price <= 99999),
    contact_info TEXT NOT NULL CHECK (contact_info ~ '^[0-9]{10}$'),
    is_sold BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.8 Lost and Found
CREATE TABLE public.lost_found (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    image_url TEXT,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.9 Chat Messages
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    random_code TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. INDEXES
-- ==========================================
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_student_profiles_session_code ON public.student_profiles(session_code);
CREATE INDEX idx_faculty_profiles_department ON public.faculty_profiles(department);
CREATE INDEX idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX idx_announcements_author ON public.announcements(author_id);
CREATE INDEX idx_complaint_box_created_at ON public.complaint_box(created_at DESC);
CREATE INDEX idx_complaint_box_user ON public.complaint_box(user_id);
CREATE INDEX idx_complaint_upvotes_complaint ON public.complaint_upvotes(complaint_id);
CREATE INDEX idx_complaint_upvotes_user ON public.complaint_upvotes(user_id);
CREATE INDEX idx_marketplace_created_at ON public.marketplace(created_at DESC);
CREATE INDEX idx_marketplace_owner ON public.marketplace(owner_id);
CREATE INDEX idx_marketplace_is_sold ON public.marketplace(is_sold);
CREATE INDEX idx_lost_found_created_at ON public.lost_found(created_at DESC);
CREATE INDEX idx_lost_found_user ON public.lost_found(user_id);

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_box ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 3.1 Users
CREATE POLICY "users_select_own" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users_select_admins" ON public.users FOR SELECT TO authenticated USING (role = 'admin');
CREATE POLICY "users_insert_own" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 3.2 Student Profiles
CREATE POLICY "student_select" ON public.student_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "student_insert" ON public.student_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "student_update" ON public.student_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 3.3 Faculty Profiles
CREATE POLICY "faculty_profiles_select" ON public.faculty_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_insert_faculty_profile" ON public.faculty_profiles FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "faculty_and_admin_update_profile" ON public.faculty_profiles FOR UPDATE TO authenticated USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 3.4 Announcements
CREATE POLICY "announcements_select" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "announcements_insert" ON public.announcements FOR INSERT TO authenticated WITH CHECK (
  author_id = auth.uid() AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('faculty', 'admin'))
);
CREATE POLICY "announcements_update" ON public.announcements FOR UPDATE TO authenticated USING (
  author_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "announcements_delete" ON public.announcements FOR DELETE TO authenticated USING (
  author_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 3.5 Complaint Box
CREATE POLICY "complaints_select" ON public.complaint_box FOR SELECT TO authenticated USING (true);
CREATE POLICY "complaints_insert" ON public.complaint_box FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'student')
);

-- 3.6 Complaint Upvotes
CREATE POLICY "upvotes_select" ON public.complaint_upvotes FOR SELECT TO authenticated USING (true);
CREATE POLICY "upvotes_insert" ON public.complaint_upvotes FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'student')
);
CREATE POLICY "upvotes_delete" ON public.complaint_upvotes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3.7 Marketplace
CREATE POLICY "marketplace_select" ON public.marketplace FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'student')
);
CREATE POLICY "marketplace_insert" ON public.marketplace FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'student')
);
CREATE POLICY "marketplace_update" ON public.marketplace FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- 3.8 Lost and Found
CREATE POLICY "lost_found_select" ON public.lost_found FOR SELECT TO authenticated USING (true);
CREATE POLICY "lost_found_insert" ON public.lost_found FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lost_found_delete" ON public.lost_found FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3.9 Chat Messages
CREATE POLICY "chat_select" ON public.chat_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'student')
);
CREATE POLICY "chat_insert" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'student')
);

-- ==========================================
-- 4. TRIGGERS & FUNCTIONS
-- ==========================================

-- 4.1 Signup Handler: Creates user row and optionally faculty profile
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_department TEXT;
  v_cabin TEXT;
  v_phone TEXT;
  v_experience INTEGER;
BEGIN
  -- Extract basic info
  v_name := NEW.raw_user_meta_data->>'full_name';
  v_role := NEW.raw_user_meta_data->>'role';

  -- Default to student if invalid or missing
  IF v_role IS NULL OR v_role NOT IN ('student', 'admin') THEN
    v_role := 'student';
  END IF;

  -- Insert into public.users
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, v_name, v_role);

  -- If role is admin, extract faculty profile info and insert
  IF v_role = 'admin' THEN
    v_department := NEW.raw_user_meta_data->>'department';
    v_cabin := NEW.raw_user_meta_data->>'cabin_no';
    v_phone := NEW.raw_user_meta_data->>'phone_no';
    
    BEGIN
      v_experience := (NEW.raw_user_meta_data->>'experience_years')::INTEGER;
    EXCEPTION WHEN OTHERS THEN
      v_experience := 0;
    END;

    INSERT INTO public.faculty_profiles (user_id, department, cabin_no, phone_no, experience_years)
    VALUES (NEW.id, v_department, v_cabin, v_phone, COALESCE(v_experience, 0));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 4.2 Email Sync Handler
CREATE OR REPLACE FUNCTION public.handle_auth_user_email_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users SET email = NEW.email WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_email_update();

-- 4.3 Rate Limit: Lost & Found (Max 2 per 24 hours)
CREATE OR REPLACE FUNCTION public.check_lost_found_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.lost_found WHERE user_id = NEW.user_id AND created_at > NOW() - INTERVAL '24 hours') >= 2 THEN
    RAISE EXCEPTION 'You can only post 2 lost & found items per 24 hours.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_lost_found_limit
  BEFORE INSERT ON public.lost_found
  FOR EACH ROW EXECUTE FUNCTION public.check_lost_found_limit();

-- 4.4 Rate Limit: Complaints (Max 1 per 7 days)
CREATE OR REPLACE FUNCTION public.check_complaint_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.complaint_box WHERE user_id = NEW.user_id AND created_at > NOW() - INTERVAL '7 days') >= 1 THEN
    RAISE EXCEPTION 'You can only submit 1 complaint every 7 days.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_complaint_limit
  BEFORE INSERT ON public.complaint_box
  FOR EACH ROW EXECUTE FUNCTION public.check_complaint_limit();

-- 4.5 Rate Limit: Marketplace (Max 1 per 3 days)
CREATE OR REPLACE FUNCTION public.check_marketplace_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.marketplace WHERE owner_id = NEW.owner_id AND created_at > NOW() - INTERVAL '3 days') >= 1 THEN
    RAISE EXCEPTION 'You can only post 1 marketplace item every 3 days.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_marketplace_limit
  BEFORE INSERT ON public.marketplace
  FOR EACH ROW EXECUTE FUNCTION public.check_marketplace_limit();

-- 11. Push Notifications Table
CREATE TABLE public.push_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, endpoint)
);

-- RLS for push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can select all subscriptions for dispatch" ON public.push_subscriptions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own subscriptions" ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id);
