-- ==============================================================================
-- MIGRATION 004: HOÀN THIỆN ĐỒNG BỘ CƠ SỞ DỮ LIỆU (SCHEMA REFINEMENT)
-- Dự án: Kepi — Keep What Matters
-- Mục tiêu:
--   1. Bổ sung cột privacy_mode vào bảng profiles (hỗ trợ chế độ ẩn tiền/làm mờ).
--   2. Bổ sung cột thumbnail_url vào bảng transactions (hỗ trợ ảnh WebP micro-thumb).
--   3. Mở rộng Check Constraint source trên bảng transactions (đủ VOICE, MANUAL, SCREENSHOT, PHOTO, QR).
-- An toàn: Chạy trong transaction, có sao lưu, có script hoàn tác.
-- ==============================================================================

BEGIN;

-- 1. BẢNG PROFILES: Bổ sung privacy_mode
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS privacy_mode BOOLEAN DEFAULT false;

-- 2. BẢNG TRANSACTIONS: Bổ sung thumbnail_url
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 3. BẢNG TRANSACTIONS: Cập nhật Check Constraint cho cột source
-- Gỡ bỏ ràng buộc cũ nếu có
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_source_check'
  ) THEN
    ALTER TABLE public.transactions DROP CONSTRAINT transactions_source_check;
  END IF;
END $$;

-- Thêm ràng buộc mới hỗ trợ đầy đủ 4 nguồn giao dịch (Đã loại bỏ VOICE để tối ưu tốc độ)
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_source_check
  CHECK (source IN ('PHOTO', 'MANUAL', 'SCREENSHOT', 'QR'));

COMMIT;

-- ==============================================================================
-- KỊCH BẢN HOÀN TÁC (ROLLBACK SCRIPT):
-- Khi cần khôi phục lại trạng thái trước migration 004, chạy đoạn mã sau:
-- ------------------------------------------------------------------------------
-- BEGIN;
--   ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_source_check;
--   ALTER TABLE public.transactions
--     ADD CONSTRAINT transactions_source_check
--     CHECK (source IN ('VOICE', 'MANUAL', 'SCREENSHOT'));
--   ALTER TABLE public.transactions DROP COLUMN IF EXISTS thumbnail_url;
--   ALTER TABLE public.profiles DROP COLUMN IF EXISTS privacy_mode;
-- COMMIT;
-- ==============================================================================
