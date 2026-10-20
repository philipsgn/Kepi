-- ==============================================================================
-- KEPI (VÍ LOCKET) — MIGRATION 005: CATEGORIES TABLE & MULTI-USER ISOLATION
-- Phiên bản: 5.1 (Production Ready & Zero-STK Compliance)
-- Mục tiêu: 
--   1. Tạo bảng danh mục tùy chỉnh (public.categories) đồng bộ với CategoryItem interface
--   2. Kích hoạt Row Level Security (RLS) cách ly 100% giữa các người dùng
--   3. Cung cấp hàm RPC get_monthly_spending_summary tính toán tập trung múi giờ UTC+7
-- ==============================================================================

BEGIN;

-- 1. BẢNG DANH MỤC TÙY CHỈNH (CATEGORIES)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Tag',
    type TEXT NOT NULL CHECK (type IN ('EXPENSE', 'INCOME')),
    color TEXT DEFAULT '#E59844',
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chỉ mục tối ưu truy vấn theo user_id và type
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(user_id, type);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(user_id, is_active);

-- Kích hoạt Row Level Security (RLS) cho bảng categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Chính sách RLS: Người dùng chỉ được SELECT, INSERT, UPDATE, DELETE danh mục của chính mình
DROP POLICY IF EXISTS "Users can only access own categories" ON public.categories;
CREATE POLICY "Users can only access own categories" ON public.categories
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. ĐẢM BẢO BẬT RLS TRÊN TOÀN BỘ CÁC BẢNG CỐT LÕI
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wait_basket ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_budget_logs ENABLE ROW LEVEL SECURITY;

-- 3. HÀM RPC: TÍNH TỔNG HỢP CHI TIÊU THÁNG TẬP TRUNG (SERVER-SIDE ASIA/HO_CHI_MINH)
CREATE OR REPLACE FUNCTION public.get_monthly_spending_summary(
    p_user_id UUID,
    p_year INT,
    p_month INT
)
RETURNS TABLE (
    total_spent NUMERIC,
    total_income NUMERIC,
    transaction_count INT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start_time TIMESTAMPTZ;
    v_end_time TIMESTAMPTZ;
BEGIN
    -- Tính thời điểm bắt đầu và kết thúc tháng theo múi giờ Việt Nam (UTC+7)
    v_start_time := make_timestamptz(p_year, p_month, 1, 0, 0, 0, 'Asia/Ho_Chi_Minh');
    v_end_time := (v_start_time + INTERVAL '1 month');

    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS total_spent,
        COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS total_income,
        COUNT(*)::INT AS transaction_count
    FROM public.transactions t
    WHERE t.user_id = p_user_id
      AND (t.status = 'CONFIRMED' OR t.status IS NULL)
      AND t.occurred_at >= v_start_time
      AND t.occurred_at < v_end_time;
END;
$$;

COMMIT;

-- ==============================================================================
-- KỊCH BẢN HOÀN TÁC (ROLLBACK SCRIPT):
-- Khi cần khôi phục lại trạng thái trước migration 005, chạy đoạn mã sau:
-- ------------------------------------------------------------------------------
-- BEGIN;
--   DROP FUNCTION IF EXISTS public.get_monthly_spending_summary(UUID, INT, INT);
--   DROP POLICY IF EXISTS "Users can only access own categories" ON public.categories;
--   DROP TABLE IF EXISTS public.categories;
-- COMMIT;
-- ==============================================================================
