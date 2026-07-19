-- ==========================================
-- ECHOCAMPUS DATABASE SNAPSHOT
-- ==========================================
-- This file is the documentation-side SQL snapshot for the current
-- application model used by the repository.
--
-- Notes:
-- - Faculty-style users are currently stored as role = 'admin'
-- - Vector-search schema for E.C.H.O lives in docs/06_VectorMigration.sql
-- - Storage buckets such as marketplace_images and lost_found_images are
--   platform resources and are not created by this SQL file

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES
-- ==========================================

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.student_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    session_code TEXT UNIQUE NOT NULL
);

CREATE TABLE public.faculty_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    department TEXT,
    phone_no TEXT,
    cabin_no TEXT,
    experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0)
);

CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.complaint_box (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    urgency TEXT NOT NULL DEFAULT 'PENDING',
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.complaint_upvotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaint_box(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    UNIQUE (complaint_id, user_id)
);

CREATE TABLE public.marketplace (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    owner_name TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    product_title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price > 0 AND price <= 99999),
    contact_info TEXT NOT NULL CHECK (contact_info ~ '^[0-9]{10}$'),
    image_url TEXT,
    is_sold BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.lost_found (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_found TEXT NOT NULL,
    contact_info TEXT NOT NULL CHECK (contact_info ~ '^[0-9]{10}$'),
    image_url TEXT,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    random_code TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, endpoint)
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
-- 3. ROW LEVEL SECURITY
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
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "users_select_own"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_select_directory_rows"
ON public.users FOR SELECT
TO authenticated
USING (role = 'admin');

CREATE POLICY "users_insert_own"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- student_profiles
CREATE POLICY "student_profiles_select"
ON public.student_profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "student_profiles_insert_own"
ON public.student_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "student_profiles_update_own"
ON public.student_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- faculty_profiles
CREATE POLICY "faculty_profiles_select_all"
ON public.faculty_profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "faculty_profiles_insert_admin"
ON public.faculty_profiles FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "faculty_profiles_update_owner_or_admin"
ON public.faculty_profiles FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- announcements
CREATE POLICY "announcements_select_all"
ON public.announcements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "announcements_insert_admin"
ON public.announcements FOR INSERT
TO authenticated
WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "announcements_update_owner_or_admin"
ON public.announcements FOR UPDATE
TO authenticated
USING (
    author_id = auth.uid()
    OR EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "announcements_delete_owner_or_admin"
ON public.announcements FOR DELETE
TO authenticated
USING (
    author_id = auth.uid()
    OR EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- complaint_box
CREATE POLICY "complaints_select_all"
ON public.complaint_box FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "complaints_insert_students"
ON public.complaint_box FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid() AND role = 'student'
    )
);

-- complaint_upvotes
CREATE POLICY "complaint_upvotes_select_all"
ON public.complaint_upvotes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "complaint_upvotes_insert_students"
ON public.complaint_upvotes FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid() AND role = 'student'
    )
);

CREATE POLICY "complaint_upvotes_delete_own"
ON public.complaint_upvotes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- marketplace
CREATE POLICY "marketplace_select_students"
ON public.marketplace FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid() AND role = 'student'
    )
);

CREATE POLICY "marketplace_insert_students"
ON public.marketplace FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid() AND role = 'student'
    )
);

CREATE POLICY "marketplace_update_owner"
ON public.marketplace FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "marketplace_delete_owner"
ON public.marketplace FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- lost_found
CREATE POLICY "lost_found_select_all"
ON public.lost_found FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "lost_found_insert_owner"
ON public.lost_found FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lost_found_update_owner"
ON public.lost_found FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "lost_found_delete_owner"
ON public.lost_found FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- chat_messages
CREATE POLICY "chat_messages_select_students"
ON public.chat_messages FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid() AND role = 'student'
    )
);

CREATE POLICY "chat_messages_insert_students"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid() AND role = 'student'
    )
);

-- push_subscriptions
CREATE POLICY "push_subscriptions_insert_own"
ON public.push_subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_subscriptions_select_authenticated"
ON public.push_subscriptions FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "push_subscriptions_delete_own"
ON public.push_subscriptions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- 4. FUNCTIONS AND TRIGGERS
-- ==========================================

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
    v_name := NEW.raw_user_meta_data->>'full_name';
    v_role := NEW.raw_user_meta_data->>'role';

    IF v_role IS NULL OR v_role NOT IN ('student', 'admin') THEN
        v_role := 'student';
    END IF;

    INSERT INTO public.users (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, COALESCE(v_name, NEW.email), v_role);

    IF v_role = 'admin' THEN
        v_department := NEW.raw_user_meta_data->>'department';
        v_cabin := NEW.raw_user_meta_data->>'cabin_no';
        v_phone := NEW.raw_user_meta_data->>'phone_no';

        BEGIN
            v_experience := (NEW.raw_user_meta_data->>'experience_years')::INTEGER;
        EXCEPTION WHEN OTHERS THEN
            v_experience := 0;
        END;

        INSERT INTO public.faculty_profiles (
            user_id,
            department,
            phone_no,
            cabin_no,
            experience_years
        )
        VALUES (
            NEW.id,
            v_department,
            v_phone,
            v_cabin,
            COALESCE(v_experience, 0)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

CREATE OR REPLACE FUNCTION public.handle_auth_user_email_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET email = NEW.email
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_email_updated
AFTER UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_email_update();

CREATE OR REPLACE FUNCTION public.check_lost_found_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM public.lost_found
        WHERE user_id = NEW.user_id
          AND created_at > NOW() - INTERVAL '24 hours'
    ) >= 2 THEN
        RAISE EXCEPTION 'You can only post 2 lost and found items per 24 hours.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_lost_found_limit
BEFORE INSERT ON public.lost_found
FOR EACH ROW EXECUTE FUNCTION public.check_lost_found_limit();

CREATE OR REPLACE FUNCTION public.check_complaint_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM public.complaint_box
        WHERE user_id = NEW.user_id
          AND created_at > NOW() - INTERVAL '7 days'
    ) >= 1 THEN
        RAISE EXCEPTION 'You can only submit 1 complaint every 7 days.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_complaint_limit
BEFORE INSERT ON public.complaint_box
FOR EACH ROW EXECUTE FUNCTION public.check_complaint_limit();

CREATE OR REPLACE FUNCTION public.check_marketplace_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM public.marketplace
        WHERE owner_id = NEW.owner_id
          AND created_at > NOW() - INTERVAL '3 days'
    ) >= 1 THEN
        RAISE EXCEPTION 'You can only post 1 marketplace item every 3 days.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_marketplace_limit
BEFORE INSERT ON public.marketplace
FOR EACH ROW EXECUTE FUNCTION public.check_marketplace_limit();
