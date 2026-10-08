-- ==============================================================================
-- MIGRATION: 002_vietqr_status_and_metadata.sql
-- DESCRIPTION: Bổ sung trạng thái giao dịch (status), nguồn (source QR/PHOTO),
--              metadata VietQR (payee_name, bank_bin, qr_kind, pending_expires_at)
-- BẢO MẬT: TUYỆT ĐỐI KHÔNG LƯU SỐ TÀI KHOẢN NGƯỜI NHẬN.
-- AN TOÀN: Chạy trong transaction, có sao lưu, có script hoàn tác.
-- ==============================================================================

BEGIN;

-- 1. Bổ sung các cột mới vào bảng transactions (nếu chưa có)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'CONFIRMED',
  ADD COLUMN IF NOT EXISTS payee_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_bin VARCHAR(10),
  ADD COLUMN IF NOT EXISTS qr_kind VARCHAR(10),
  ADD COLUMN IF NOT EXISTS pending_expires_at TIMESTAMPTZ;

-- 2. Thêm ràng buộc Check Constraints (an toàn không lỗi nếu đã tồn tại)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_transaction_status'
  ) THEN
    ALTER TABLE transactions
      ADD CONSTRAINT check_transaction_status
      CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_transaction_qr_kind'
  ) THEN
    ALTER TABLE transactions
      ADD CONSTRAINT check_transaction_qr_kind
      CHECK (qr_kind IS NULL OR qr_kind IN ('STATIC', 'DYNAMIC'));
  END IF;
END $$;

-- 3. Tạo index tối ưu hóa truy vấn các khoản chờ xác nhận theo người dùng
CREATE INDEX IF NOT EXISTS idx_transactions_status_user
  ON transactions(user_id, status);

-- 4. Đảm bảo toàn bộ dữ liệu cũ có status = 'CONFIRMED' để bảo toàn tính toàn vẹn
UPDATE transactions
  SET status = 'CONFIRMED'
  WHERE status IS NULL;

COMMIT;

-- ==============================================================================
-- KỊCH BẢN HOÀN TÁC (ROLLBACK SCRIPT):
-- Khi cần khôi phục lại trạng thái trước migration, chạy đoạn mã sau:
-- ------------------------------------------------------------------------------
-- BEGIN;
--   DROP INDEX IF EXISTS idx_transactions_status_user;
--   ALTER TABLE transactions DROP CONSTRAINT IF EXISTS check_transaction_status;
--   ALTER TABLE transactions DROP CONSTRAINT IF EXISTS check_transaction_qr_kind;
--   ALTER TABLE transactions
--     DROP COLUMN IF EXISTS pending_expires_at,
--     DROP COLUMN IF EXISTS qr_kind,
--     DROP COLUMN IF EXISTS bank_bin,
--     DROP COLUMN IF EXISTS payee_name,
--     DROP COLUMN IF EXISTS status;
-- COMMIT;
-- ==============================================================================
