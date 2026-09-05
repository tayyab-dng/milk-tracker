-- ====================================================================
-- MILK TRACKER - SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase Dashboard:
-- SQL Editor -> New Query -> Paste & Run (Ctrl+Enter / Cmd+Enter)
-- ====================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. USER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_name TEXT DEFAULT 'Supplier',
    default_rate NUMERIC DEFAULT 60,
    currency TEXT DEFAULT 'PKR',
    default_quantity NUMERIC DEFAULT 1.0,
    quick_quantities JSONB DEFAULT '[0.5, 1.0, 1.5, 2.0]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. MILK ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.milk_entries (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    quantity NUMERIC NOT NULL,
    shift TEXT NOT NULL DEFAULT 'Morning',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast queries by user and date
CREATE INDEX IF NOT EXISTS idx_milk_entries_user_date ON public.milk_entries(user_id, date DESC);

-- Enable RLS on milk_entries
ALTER TABLE public.milk_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
    ON public.milk_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
    ON public.milk_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
    ON public.milk_entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
    ON public.milk_entries FOR DELETE
    USING (auth.uid() = user_id);

-- 4. MONTHLY SUMMARIES (Rates & Payment status per month)
CREATE TABLE IF NOT EXISTS public.monthly_summaries (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: YYYY-MM
    rate NUMERIC,
    is_paid BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_month UNIQUE (user_id, month)
);

-- Indexes for monthly summaries
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user_month ON public.monthly_summaries(user_id, month DESC);

-- Enable RLS on monthly_summaries
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own monthly summaries"
    ON public.monthly_summaries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly summaries"
    ON public.monthly_summaries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly summaries"
    ON public.monthly_summaries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own monthly summaries"
    ON public.monthly_summaries FOR DELETE
    USING (auth.uid() = user_id);

-- 5. TRIGGER: Auto-create profile upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_settings (user_id, supplier_name, default_rate, currency, default_quantity, quick_quantities, updated_at)
    VALUES (
        NEW.id,
        'Supplier',
        60,
        'PKR',
        1.0,
        '[0.5, 1.0, 1.5, 2.0]'::jsonb,
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
