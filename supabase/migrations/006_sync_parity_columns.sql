-- Migration 006: Đồng bộ đầy đủ các cột Transaction & ràng buộc UNIQUE(user_id) cho financial_settings (Quyết định 200)

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'PHOTO',
  ADD COLUMN IF NOT EXISTS is_squad_private BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS receipt_data JSONB,
  ADD COLUMN IF NOT EXISTS sentiment_rating INTEGER,
  ADD COLUMN IF NOT EXISTS desc_position JSONB,
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_name TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT;

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_source_check;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_source_check
  CHECK (source IN ('PHOTO', 'MANUAL', 'SCREENSHOT', 'QR', 'VOICE', 'OCR', 'BANK_NOTI', 'E_WALLET'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'financial_settings_user_id_key'
  ) THEN
    ALTER TABLE public.financial_settings
      ADD CONSTRAINT financial_settings_user_id_key UNIQUE (user_id);
  END IF;
END $$;
