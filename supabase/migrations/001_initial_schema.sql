-- ============================================================================
-- SUPABASE MIGRATION 001: INITIAL SCHEMA FOR VÍ LOCKET (M0)
-- ============================================================================

-- Bật UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BẢNG HỒ SƠ NGƯỜI DÙNG (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    birthdate DATE,
    fav_unit TEXT DEFAULT 'tra_sua' CHECK (fav_unit IN ('tra_sua', 'ca_phe', 'to_pho')),
    hourly_rate NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG THIẾT LẬP TÀI CHÍNH & MỤC TIÊU (FINANCIAL_SETTINGS)
CREATE TABLE IF NOT EXISTS public.financial_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    monthly_income NUMERIC DEFAULT 0,
    monthly_fixed_costs NUMERIC DEFAULT 0,
    goal_name TEXT,
    goal_target_amount NUMERIC DEFAULT 0,
    goal_deadline DATE,
    base_daily_budget NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG GIAO DỊCH THU / CHI (TRANSACTIONS)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('EXPENSE', 'INCOME', 'ADJUST')),
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    photo_url TEXT,
    payment_method TEXT DEFAULT 'BANK' CHECK (payment_method IN ('CASH', 'BANK', 'E_WALLET')),
    source TEXT DEFAULT 'VOICE' CHECK (source IN ('VOICE', 'MANUAL', 'SCREENSHOT')),
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG GIỎ CHỜ CẢN GẮT (WAIT_BASKET)
CREATE TABLE IF NOT EXISTS public.wait_basket (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'BOUGHT', 'SKIPPED')),
    remind_interval_hours INT DEFAULT 2,
    next_remind_at TIMESTAMPTZ,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG TỔNG KẾT NGÀY & ROLLOVER (DAILY_BUDGET_LOGS)
CREATE TABLE IF NOT EXISTS public.daily_budget_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    allocated_budget NUMERIC NOT NULL,
    actual_spent NUMERIC DEFAULT 0,
    rollover_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wait_basket ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_budget_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Người dùng chỉ xem và sửa hồ sơ của chính mình
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Financial Settings:
CREATE POLICY "Users manage own financial settings" 
    ON public.financial_settings FOR ALL USING (auth.uid() = user_id);

-- Transactions:
CREATE POLICY "Users manage own transactions" 
    ON public.transactions FOR ALL USING (auth.uid() = user_id);

-- Wait Basket:
CREATE POLICY "Users manage own wait basket" 
    ON public.wait_basket FOR ALL USING (auth.uid() = user_id);

-- Daily Budget Logs:
CREATE POLICY "Users manage own daily budget logs" 
    ON public.daily_budget_logs FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- STORAGE BUCKET: item-photos
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('item-photos', 'item-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own item photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'item-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own item photos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'item-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);
