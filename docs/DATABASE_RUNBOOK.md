# SỔ TAY VẬN HÀNH CƠ SỞ DỮ LIỆU (DATABASE RUNBOOK)

> **Dự án:** Kepi (Ví Locket) — Mobile App Chi Tiêu Bằng Ảnh & Quét Mã QR  
> **Cơ sở dữ liệu:** Supabase PostgreSQL Cloud  
> **Project ID:** `yohzbxywumczegtifvfl`  
> **Project URL:** `https://yohzbxywumczegtifvfl.supabase.co`  
> **Phiên bản tài liệu:** 2.0 (Migration 005 Ready)

---

## 📋 MỤC LỤC
1. [Hướng Dẫn Áp Dụng Migration 005 (Categories & Multi-User Isolation)](#1-hướng-dẫn-áp-dụng-migration-005)
2. [Quy Trình Kiểm Tra & Xác Nhận Sau Migration](#2-quy-trình-kiểm-tra--xác-nhận-sau-migration)
3. [Kịch Bản Hoàn Tác (Rollback Playbook)](#3-kịch-bản-hoàn-tác-rollback-playbook)
4. [Quy Trình Sao Lưu Dữ Liệu (Backup Procedures)](#4-quy-trình-sao-lưu-dữ-liệu-backup-procedures)
5. [Quy Trình Phục Hồi Dữ Liệu (Restore Procedures)](#5-quy-trình-phục-hồi-dữ-liệu-restore-procedures)
6. [Kịch Bản Ứng Phó Sự Cố & Giám Sát (Disaster Recovery & Health Check)](#6-kịch-bản-ứng-phó-sự-cố--giám-sát)

---

## 1. HƯỚNG DẪN ÁP DỤNG MIGRATION 005

Migration `005_categories_and_sync.sql` bổ sung bảng danh mục tùy chỉnh `public.categories`, kích hoạt Row Level Security (RLS) bảo vệ dữ liệu độc lập 100% giữa các người dùng, và tạo hàm RPC `get_monthly_spending_summary` tính toán số liệu chi tiêu tập trung chuẩn múi giờ Việt Nam (`Asia/Ho_Chi_Minh` UTC+7).

### Bước 1: Mở Supabase SQL Editor
1. Truy cập trực tiếp trang SQL Editor của dự án:  
   👉 **URL:** [https://supabase.com/dashboard/project/yohzbxywumczegtifvfl/sql/new](https://supabase.com/dashboard/project/yohzbxywumczegtifvfl/sql/new)
2. Đăng nhập với tài khoản quản trị dự án Supabase nếu được yêu cầu.

### Bước 2: Sao chép nội dung Migration Script
Mở tệp `supabase/migrations/005_categories_and_sync.sql` và sao chép toàn bộ khối lệnh sau:

```sql
-- ==============================================================================
-- KEPI (VÍ LOCKET) — MIGRATION 005: CATEGORIES TABLE & MULTI-USER ISOLATION
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
```

### Bước 3: Thực thi mã SQL
1. Dán toàn bộ mã trên vào ô soạn thảo SQL Editor.
2. Bấm nút **RUN** (hoặc tổ hợp phím `Ctrl + Enter` trên Windows / `Cmd + Enter` trên macOS).
3. Đảm bảo thông báo trả về hiển thị: `Success. No rows returned`.

---

## 2. QUY TRÌNH KIỂM TRA & XÁC NHẬN SAU MIGRATION

Sau khi chạy lệnh RUN trên SQL Editor, mở một tab truy vấn mới và chạy đoạn SQL sau để nghiệm thu:

```sql
-- 1. Kiểm tra bảng categories đã tồn tại và hiển thị đúng các cột
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- 2. Kiểm tra RLS đã được BẬT (kết quả rowsecurity = true)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('categories', 'profiles', 'transactions', 'financial_settings', 'wait_basket');

-- 3. Kiểm tra Chính sách RLS đã kích hoạt
SELECT policyname, tablename, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'categories';

-- 4. Kiểm tra Hàm RPC get_monthly_spending_summary
SELECT routine_name, routine_type, security_type 
FROM information_schema.routines 
WHERE routine_name = 'get_monthly_spending_summary';
```

**Tiêu chuẩn nghiệm thu:**
- Cột `rowsecurity` của bảng `categories` phải là `true`.
- Policy `Users can only access own categories` xuất hiện với lệnh `FOR ALL`.
- Routine `get_monthly_spending_summary` xuất hiện với `security_type = DEFINER`.

---

## 3. KỊCH BẢN HOÀN TÁC (ROLLBACK PLAYBOOK)

Trong trường hợp xảy ra lỗi ngoài ý muốn hoặc cần hủy bỏ thay đổi từ Migration 005, dán đoạn mã sau vào SQL Editor và bấm **RUN**:

```sql
BEGIN;
  -- 1. Gỡ bỏ hàm RPC
  DROP FUNCTION IF EXISTS public.get_monthly_spending_summary(UUID, INT, INT);

  -- 2. Gỡ bỏ chính sách RLS trên bảng categories
  DROP POLICY IF EXISTS "Users can only access own categories" ON public.categories;

  -- 3. Xóa bảng categories
  DROP TABLE IF EXISTS public.categories CASCADE;
COMMIT;
```

---

## 4. QUY TRÌNH SAO LƯU DỮ LIỆU (BACKUP PROCEDURES)

### 4.1. Sao Lưu Tự Động Trên Supabase Cloud (Daily Backups & PITR)
- Supabase tự động sao lưu CSDL hàng ngày lúc nửa đêm (UTC).
- Với các gói có PITR (Point-in-Time Recovery), hệ thống cho phép khôi phục về từng giây trong vòng 7-30 ngày.
- Kiểm tra trạng thái sao lưu tại:  
  👉 `https://supabase.com/dashboard/project/yohzbxywumczegtifvfl/settings/database` -> **Backups**

### 4.2. Sao Lưu Thủ Công Bằng Supabase CLI (Dành cho Kỹ sư Vận hành)
Cài đặt Supabase CLI và chạy lệnh tạo bản chụp dữ liệu cục bộ:

```powershell
# Đăng nhập Supabase CLI
supabase login

# Xuất toàn bộ CSDL (Schema + Data)
supabase db dump --project-ref yohzbxywumczegtifvfl -f "kepi_full_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

# Xuất riêng Schema (Cấu trúc bảng, RLS và Hàm RPC)
supabase db dump --project-ref yohzbxywumczegtifvfl --schema-only -f "kepi_schema_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

# Xuất riêng Dữ liệu
supabase db dump --project-ref yohzbxywumczegtifvfl --data-only -f "kepi_data_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
```

### 4.3. Sao Lưu Trực Tiếp Qua `pg_dump` (PostgreSQL Client)
Nếu sử dụng máy chủ có sẵn công cụ `pg_dump`:

```powershell
# Chuỗi kết nối Database Pooler (Cổng 6543 hoặc 5432)
$DB_URL = "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

pg_dump -d $DB_URL -F c -b -v -f "kepi_backup_$(Get-Date -Format 'yyyyMMdd').dump"
```

> 🔒 **NGUYÊN TẮC BẢO MẬT BẢN SAO LƯU:**
> 1. Tệp sao lưu `.dump` hoặc `.sql` chứa dữ liệu người dùng phải được mã hóa trước khi lưu trữ.
> 2. **Tuyệt đối không commit tệp backup vào GitHub repository.**
> 3. Tệp sao lưu phải tuân thủ chính sách Zero-STK (không chứa số tài khoản ngân hàng).

---

## 5. QUY TRÌNH PHỤC HỒI DỮ LIỆU (RESTORE PROCEDURES)

### 5.1. Phục Hồi Qua Supabase Dashboard
1. Truy cập **Settings** ➔ **Database** ➔ **Backups**.
2. Chọn mốc sao lưu gần nhất cần khôi phục hoặc chọn thời điểm Point-in-Time.
3. Bấm **Restore** và chờ thông báo hoàn tất (thường từ 2 - 5 phút tùy dung lượng).

### 5.2. Phục Hồi Thủ Công Bằng `pg_restore` (Khôi phục thảm họa)
Trong trường hợp phục hồi sang một instance mới hoặc khôi phục bảng chỉ định:

```powershell
# Khôi phục toàn bộ dữ liệu từ tệp dump
$DB_URL = "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

pg_restore -d $DB_URL -v --clean --if-exists "kepi_backup_20261018.dump"
```

### 5.3. Danh Sách Kiểm Tra Hậu Khôi Phục (Post-Restore Checklist)
1. Chạy `node scripts/verify_supabase_real.js` để kiểm tra kết nối HTTP 200 và trạng thái các bảng.
2. Kiểm tra RLS còn kích hoạt đầy đủ trên toàn bộ các bảng:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```
3. Kiểm tra số lượng bản ghi `profiles` và `transactions` khớp với số lượng trước sự cố.
4. Kiểm tra Storage Buckets `receipt-photos` và `item-photos` vẫn liên kết bình thường.

---

## 6. KỊCH BẢN ỨNG PHÓ SỰ CỐ & GIÁM SÁT

### 6.1. Kiểm Tra Sức Khỏe Máy Chủ (Health Check)
Hệ thống Kepi sử dụng script kiểm thử tự động tại `scripts/verify_supabase_real.js`:
- Endpoint Health: `GET https://yohzbxywumczegtifvfl.supabase.co/auth/v1/health`
- Kỳ vọng: HTTP `200 OK`, JSON `{"version":"v2.x.x","name":"GoTrue"}`.

### 6.2. Ứng Phó Sự Cố Mất Kết Nối (Connection Outage)
Khi máy chủ Supabase báo lỗi `503 Service Unavailable` hoặc rớt mạng:
1. **Phía Mobile Client:** Ứng dụng tự động kích hoạt `Guest Mode / Local Cache Fallback`. Toàn bộ thao tác ghi chép bằng ảnh, nhập nhanh, tính toán ngân sách tiếp tục hoạt động ngoại tuyến (`AsyncStorage`).
2. **Khi Có Mạng Trở Lại:** Ứng dụng thực hiện cơ chế tự động đồng bộ bù (Deferred Cloud Sync) mà không gây gián đoạn cho người dùng.
3. **Phía Kỹ Sư Backend:**
   - Kiểm tra trạng thái máy chủ tại [status.supabase.com](https://status.supabase.com).
   - Chạy script `node scripts/verify_supabase_real.js`.
   - Chạy kiểm thử hồi quy `node run-all-tests.js` (yêu cầu 42/42 tests pass).
