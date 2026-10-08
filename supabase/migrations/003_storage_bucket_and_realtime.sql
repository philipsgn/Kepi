-- ==============================================================================
-- MIGRATION 003: TẠO STORAGE BUCKET ẢNH BIÊN LAI & BẬT REALTIME CHO GIAO DỊCH
-- Dự án: Kepi — Keep What Matters
-- Áp dụng cho: Supabase Cloud Storage & Realtime Engine
-- ==============================================================================

-- 1. TẠO BUCKET receipt-photos (nếu chưa có)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipt-photos',
  'receipt-photos',
  true,
  10485760, -- Giới hạn tối đa 10MB/tệp
  ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png'];

-- 2. THIẾT LẬP ROW LEVEL SECURITY (RLS) CHO BUCKET receipt-photos
-- Cho phép bất kỳ ai đọc ảnh công khai qua URL
DROP POLICY IF EXISTS "Public Read Receipt Photos" ON storage.objects;
CREATE POLICY "Public Read Receipt Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipt-photos');

-- Chỉ cho phép người dùng đã đăng nhập tải ảnh vào thư mục userId của chính mình
DROP POLICY IF EXISTS "Authenticated Users Upload Own Photos" ON storage.objects;
CREATE POLICY "Authenticated Users Upload Own Photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipt-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Chỉ cho phép người dùng sửa hoặc xóa ảnh trong thư mục userId của chính mình
DROP POLICY IF EXISTS "Users Update Own Photos" ON storage.objects;
CREATE POLICY "Users Update Own Photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'receipt-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users Delete Own Photos" ON storage.objects;
CREATE POLICY "Users Delete Own Photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipt-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. KÍCH HOẠT REALTIME CHO BẢNG GIAO DỊCH (TRANSACTIONS)
-- Đảm bảo publication supabase_realtime đã đăng ký bảng transactions để lắng nghe thay đổi 2 chiều
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  END IF;
END $$;
