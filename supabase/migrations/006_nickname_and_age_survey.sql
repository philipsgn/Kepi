-- ==============================================================================
-- KEPI (VÍ LOCKET / PIGFLY) — MIGRATION 006: NICKNAME & AGE SURVEY SYSTEM
-- Phiên bản: 6.0 (Zero-Friction Demographics Analytics & Secure RPC)
-- Mục tiêu:
--   1. Tạo bảng khảo sát nhân khẩu học người dùng ẩn danh (public.user_surveys)
--   2. Hàm RPC check_nickname_available kiểm tra trùng biệt danh không bị chặn bởi RLS
--   3. Hàm RPC submit_age_survey ghi nhận khảo sát độ tuổi theo device_id an toàn
-- ==============================================================================

BEGIN;

-- 1. BẢNG KHẢO SÁT NHÂN KHẨU HỌC & ĐỘ TUỔI (USER_SURVEYS)
CREATE TABLE IF NOT EXISTS public.user_surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT NOT NULL UNIQUE,
    nickname TEXT NOT NULL,
    birth_year INT,
    birthdate DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chỉ mục tối ưu hóa tìm kiếm biệt danh và thống kê độ tuổi
CREATE INDEX IF NOT EXISTS idx_user_surveys_device ON public.user_surveys(device_id);
CREATE INDEX IF NOT EXISTS idx_user_surveys_nickname ON public.user_surveys(lower(nickname));
CREATE INDEX IF NOT EXISTS idx_user_surveys_birth_year ON public.user_surveys(birth_year);

-- Kích hoạt Row Level Security (RLS) cho bảng user_surveys
ALTER TABLE public.user_surveys ENABLE ROW LEVEL SECURITY;

-- Chính sách RLS: Cho phép mọi client (kể cả anon không có JWT) ghi nhận/cập nhật khảo sát của thiết bị
DROP POLICY IF EXISTS "Anyone can insert or update own device survey" ON public.user_surveys;
CREATE POLICY "Anyone can insert or update own device survey"
    ON public.user_surveys
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 2. HÀM RPC: KIỂM TRA TÍNH KHẢ DỤNG CỦA BIỆT DANH (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.check_nickname_available(p_nickname TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    clean_name TEXT;
BEGIN
    clean_name := lower(trim(COALESCE(p_nickname, '')));
    IF clean_name = '' THEN
        RETURN TRUE;
    END IF;

    -- Kiểm tra trong bảng profiles
    IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE lower(trim(COALESCE(full_name, ''))) = clean_name
    ) THEN
        RETURN FALSE;
    END IF;

    -- Kiểm tra trong bảng user_surveys
    IF EXISTS (
        SELECT 1 FROM public.user_surveys 
        WHERE lower(trim(nickname)) = clean_name
    ) THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;

-- Cấp quyền thực thi cho cả anon và authenticated
GRANT EXECUTE ON FUNCTION public.check_nickname_available(TEXT) TO anon, authenticated;

-- 3. HÀM RPC: GỬI DỮ LIỆU KHẢO SÁT ĐỘ TUỔI THEO THIẾT BỊ (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.submit_age_survey(
    p_device_id TEXT,
    p_nickname TEXT,
    p_birth_year INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_birthdate DATE := NULL;
    v_clean_nick TEXT;
BEGIN
    v_clean_nick := trim(COALESCE(p_nickname, ''));
    IF v_clean_nick = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Nickname cannot be empty');
    END IF;

    IF p_birth_year IS NOT NULL AND p_birth_year >= 1900 AND p_birth_year <= EXTRACT(YEAR FROM CURRENT_DATE) THEN
        v_birthdate := to_date(p_birth_year::text || '-01-01', 'YYYY-MM-DD');
    END IF;

    INSERT INTO public.user_surveys (device_id, nickname, birth_year, birthdate, updated_at)
    VALUES (p_device_id, v_clean_nick, p_birth_year, v_birthdate, NOW())
    ON CONFLICT (device_id) 
    DO UPDATE SET
        nickname = EXCLUDED.nickname,
        birth_year = EXCLUDED.birth_year,
        birthdate = EXCLUDED.birthdate,
        updated_at = NOW();

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Cấp quyền thực thi cho cả anon và authenticated
GRANT EXECUTE ON FUNCTION public.submit_age_survey(TEXT, TEXT, INT) TO anon, authenticated;

COMMIT;

-- ==============================================================================
-- KỊCH BẢN HOÀN TÁC (ROLLBACK SCRIPT):
-- Khi cần khôi phục lại trạng thái trước migration 006, chạy đoạn mã sau:
-- ------------------------------------------------------------------------------
-- BEGIN;
--   DROP FUNCTION IF EXISTS public.submit_age_survey(TEXT, TEXT, INT);
--   DROP FUNCTION IF EXISTS public.check_nickname_available(TEXT);
--   DROP POLICY IF EXISTS "Anyone can insert or update own device survey" ON public.user_surveys;
--   DROP TABLE IF EXISTS public.user_surveys;
-- COMMIT;
-- ==============================================================================
