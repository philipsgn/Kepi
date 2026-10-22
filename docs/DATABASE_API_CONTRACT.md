# TÀI LIỆU HỢP ĐỒNG API & ĐẶC TẢ CƠ SỞ DỮ LIỆU (DATABASE & API CONTRACT)

> **Dự án:** Kepi (Ví Locket) — Sổ Chi Tiêu Bằng Ảnh & Quét Mã QR  
> **Cơ sở dữ liệu:** Supabase PostgreSQL Cloud (`https://yohzbxywumczegtifvfl.supabase.co`)  
> **Phiên bản tài liệu:** 2.0 (Migration 001 - 005)  
> **Trạng thái:** Active (HTTP 200 OK verified)  
> **Nguyên tắc bất di bất dịch:** ZERO-STK PRIVACY — Tuyệt đối không lưu số tài khoản người nhận.

---

## 1. TỔNG QUAN HẠ TẦNG CSDL (INFRASTRUCTURE OVERVIEW)

- **Supabase Host:** `https://yohzbxywumczegtifvfl.supabase.co`
- **Auth Engine:** GoTrue v2.197.0 (Email OTP / Magic Link, Google OAuth)
- **Database Engine:** PostgreSQL 15+ có Row Level Security (RLS) bắt buộc trên 100% các bảng.
- **Realtime Engine:** WebSocket Publication `supabase_realtime` cho bảng `transactions`.
- **Storage Buckets:**
  - `receipt-photos`: Public Read, authenticated upload/update/delete theo folder `userId`.
  - `item-photos`: Private bucket dành cho ảnh vật phẩm giỏ chờ.

---

## 2. BẢN ĐẶC TẢ CHI TIẾT CÁC BẢNG (DATABASE SCHEMA CONTRACT)

### 2.1. Bảng `public.profiles` (Hồ Sơ Người Dùng)
Bảng lưu trữ thông tin cá nhân cơ bản và cấu hình hiển thị của người dùng.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc (Constraints) | Mô Tả & Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE` | Khóa chính, đồng bộ 1-1 với tài khoản Supabase Auth |
| `email` | `TEXT` | `UNIQUE` | Địa chỉ email đăng ký của người dùng |
| `full_name` | `TEXT` | | Họ tên hiển thị |
| `birthdate` | `DATE` | | Ngày sinh (tính toán tuổi tài chính) |
| `fav_unit` | `TEXT` | `DEFAULT 'tra_sua' CHECK (fav_unit IN ('tra_sua', 'ca_phe', 'to_pho'))` | Đơn vị quy đổi quen thuộc Hà Nội |
| `hourly_rate` | `NUMERIC` | `DEFAULT 0` | Mức thu nhập quy đổi theo giờ (VNĐ/giờ) |
| `privacy_mode` | `BOOLEAN` | `DEFAULT FALSE` | Chế độ làm mờ số tiền chống nhìn trộm nơi công cộng |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm tạo hồ sơ |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm cập nhật hồ sơ gần nhất |

**RLS Policies:**
- `Users can view own profile`: `FOR SELECT USING (auth.uid() = id)`
- `Users can update own profile`: `FOR UPDATE USING (auth.uid() = id)`
- `Users can insert own profile`: `FOR INSERT WITH CHECK (auth.uid() = id)`

---

### 2.2. Bảng `public.financial_settings` (Cấu Hình Ngân Sách & Mục Tiêu)
Bảng lưu trữ tham số tính toán ngân sách ngày và mục tiêu tiết kiệm.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc (Constraints) | Mô Tả & Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT uuid_generate_v4()` | Khóa chính của bản ghi |
| `user_id` | `UUID` | `NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE` | Khóa ngoại liên kết người dùng sở hữu |
| `monthly_income` | `NUMERIC` | `DEFAULT 0` | Tổng thu nhập hàng tháng dự kiến (VNĐ) |
| `monthly_fixed_costs` | `NUMERIC` | `DEFAULT 0` | Chi phí cố định hàng tháng (tiền nhà, hóa đơn...) |
| `goal_name` | `TEXT` | | Tên mục tiêu tiết kiệm (ví dụ: 'Mua MacBook', 'Đi Sapa') |
| `goal_target_amount` | `NUMERIC` | `DEFAULT 0` | Số tiền mục tiêu cần tích lũy (VNĐ) |
| `goal_deadline` | `DATE` | | Hạn chót mục tiêu (dự báo ETA) |
| `base_daily_budget` | `NUMERIC` | `DEFAULT 0` | Ngân sách sinh hoạt gốc mỗi ngày |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm cập nhật gần nhất |

**RLS Policies:**
- `Users manage own financial settings`: `FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`

---

### 2.3. Bảng `public.transactions` (Nhật Ký Giao Dịch Thu / Chi)
Bảng cốt lõi ghi nhận toàn bộ hoạt động thu, chi và điều chỉnh số dư.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc (Constraints) | Mô Tả & Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT uuid_generate_v4()` | Khóa chính giao dịch |
| `user_id` | `UUID` | `NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE` | Khóa ngoại liên kết người dùng sở hữu |
| `type` | `TEXT` | `NOT NULL CHECK (type IN ('EXPENSE', 'INCOME', 'ADJUST'))` | Loại giao dịch: Chi tiêu, Thu nhập, hoặc Điều chỉnh |
| `amount` | `NUMERIC` | `NOT NULL CHECK (amount >= 0)` | Số tiền giao dịch (VNĐ) |
| `category` | `TEXT` | `NOT NULL` | Mã danh mục (ví dụ: 'an_uong', 'di_chuyen', hoặc custom id) |
| `description` | `TEXT` | | Ghi chú ngắn gọn về giao dịch |
| `photo_url` | `TEXT` | | URL ảnh chụp hóa đơn / món hàng độ phân giải cao |
| `thumbnail_url` | `TEXT` | | URL ảnh WebP thu nhỏ tải nhanh trên màn hình Album/Home |
| `payment_method` | `TEXT` | `DEFAULT 'BANK' CHECK (payment_method IN ('CASH', 'BANK', 'E_WALLET'))` | Hình thức thanh toán |
| `source` | `TEXT` | `CHECK (source IN ('PHOTO', 'MANUAL', 'SCREENSHOT', 'QR'))` | Nguồn tạo: Chụp ảnh, Nhập tay, Ảnh chụp màn hình, Quét QR |
| `status` | `VARCHAR(20)` | `DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED'))` | Trạng thái: Chờ xác nhận, Đã xác nhận, Đã hủy |
| `payee_name` | `TEXT` | | Tên người nhận tiền hiển thị (từ mã QR VietQR) |
| `bank_bin` | `VARCHAR(10)` | | Mã định danh ngân hàng NAPAS (ví dụ: '970422' - MBBank) |
| `qr_kind` | `VARCHAR(10)` | `CHECK (qr_kind IS NULL OR qr_kind IN ('STATIC', 'DYNAMIC'))` | Loại QR: Tĩnh (chưa có tiền) hoặc Động (đã kèm số tiền) |
| `pending_expires_at`| `TIMESTAMPTZ` | | Hạn chờ xác nhận (Screenshot: 7 ngày; QR: giữ >24h) |
| `occurred_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm giao dịch thực tế diễn ra |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm tạo bản ghi trên hệ thống |

> ⚠️ **TUYỆT ĐỐI KHÔNG CÓ CỘT SỐ TÀI KHOẢN (ACCOUNT_NUMBER / STK):** Hệ thống chỉ lưu `payee_name` và `bank_bin` để hiển thị tên đối tác và logo ngân hàng, không bao giờ lưu trữ số tài khoản ngân hàng của người nhận.

**Chỉ mục tối ưu:**
- `idx_transactions_status_user`: `(user_id, status)` tối ưu truy vấn các khoản Chờ Xác Nhận (Confirmation Inbox).

**RLS Policies:**
- `Users manage own transactions`: `FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`

---

### 2.4. Bảng `public.wait_basket` (Giỏ Chờ Cản Gắt — Chống FOMO)
Bảng ghi nhận các món đồ đang phân vân muốn mua để người dùng trì hoãn cảm xúc bốc đồng.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc (Constraints) | Mô Tả & Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT uuid_generate_v4()` | Khóa chính món đồ |
| `user_id` | `UUID` | `NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE` | Khóa ngoại người sở hữu |
| `item_name` | `TEXT` | `NOT NULL` | Tên món đồ muốn mua |
| `amount` | `NUMERIC` | `NOT NULL` | Giá tiền món đồ |
| `category` | `TEXT` | | Danh mục món đồ |
| `photo_url` | `TEXT` | | URL ảnh chụp món đồ |
| `status` | `TEXT` | `DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'BOUGHT', 'SKIPPED'))` | Trạng thái: Đang chờ, Đã quyết định mua, Đã bỏ qua |
| `remind_interval_hours` | `INT` | `DEFAULT 2` | Khoảng thời gian nhắc nhở suy nghĩ lại (giờ) |
| `next_remind_at` | `TIMESTAMPTZ` | | Thời điểm thông báo nhắc nhở tiếp theo |
| `decided_at` | `TIMESTAMPTZ` | | Thời điểm người dùng ra quyết định cuối cùng |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm đưa vào giỏ chờ |

**RLS Policies:**
- `Users manage own wait basket`: `FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`

---

### 2.5. Bảng `public.daily_budget_logs` (Nhật Ký Ngân Sách Ngày & Rollover)
Lưu trữ hạn mức chi tiêu hàng ngày và số tiền Rollover (cộng dồn hoặc bù lỗ) 100%.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc (Constraints) | Mô Tả & Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT uuid_generate_v4()` | Khóa chính nhật ký ngày |
| `user_id` | `UUID` | `NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE` | Khóa ngoại người sở hữu |
| `log_date` | `DATE` | `NOT NULL` | Ngày ghi nhận (YYYY-MM-DD) |
| `allocated_budget` | `NUMERIC` | `NOT NULL` | Ngân sách được phân bổ cho ngày này |
| `actual_spent` | `NUMERIC` | `DEFAULT 0` | Số tiền thực tế đã chi tiêu (chỉ tính CONFIRMED) |
| `rollover_amount` | `NUMERIC` | `DEFAULT 0` | Số tiền dư / thâm hụt chuyển tiếp sang ngày hôm sau |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm tạo bản ghi |

**Ràng buộc duy nhất:** `UNIQUE(user_id, log_date)`

**RLS Policies:**
- `Users manage own daily budget logs`: `FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`

---

### 2.6. Bảng `public.categories` (Danh Mục Tùy Biến — Migration 005)
Bảng hỗ trợ người dùng phân tách Thu / Chi và tạo danh mục mang dấu ấn cá nhân.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc (Constraints) | Mô Tả & Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Định danh danh mục (ví dụ: 'an_uong', 'cat_custom_1729230000') |
| `user_id` | `UUID` | `NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE` | Khóa ngoại người dùng sở hữu danh mục |
| `name` | `TEXT` | `NOT NULL` | Tên hiển thị (ví dụ: 'Cho mẹ', 'Nuôi mèo') |
| `icon` | `TEXT` | `NOT NULL DEFAULT 'Tag'` | Tên icon Vector Lucide (`Heart`, `Car`, `Utensils`...) |
| `type` | `TEXT` | `NOT NULL CHECK (type IN ('EXPENSE', 'INCOME'))` | Phân loại: Chi tiêu hoặc Thu nhập |
| `color` | `TEXT` | `DEFAULT '#E59844'` | Mã màu HEX đại diện (Palette Hà Nội Thu Đông) |
| `is_system` | `BOOLEAN` | `DEFAULT FALSE` | Đánh dấu danh mục mặc định của hệ thống |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Trạng thái hiển thị (Soft Delete Guard: false = ẩn) |
| `order_index` | `INT` | `DEFAULT 0` | Thứ tự ưu tiên sắp xếp khi hiển thị trên giao diện |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm tạo |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm cập nhật |

**Chỉ mục tối ưu:**
- `idx_categories_user`: `(user_id)`
- `idx_categories_type`: `(user_id, type)`
- `idx_categories_active`: `(user_id, is_active)`

**RLS Policies:**
- `Users can only access own categories`: `FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`

---

### 2.7. Bảng `public.user_surveys` (Khảo Sát Độ Tuổi & Định Danh Thiết Bị — Migration 006)
Bảng ghi nhận số liệu nhân khẩu học (Biệt danh, Năm sinh, Độ tuổi) độc lập với Supabase Auth JWT, cho phép chủ ứng dụng phân tích cơ cấu độ tuổi người dùng ẩn danh / cục bộ.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc (Constraints) | Mô Tả & Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT uuid_generate_v4()` | Khóa chính bản ghi khảo sát |
| `device_id` | `TEXT` | `NOT NULL UNIQUE` | Định danh thiết bị cố định (`@vi_locket_device_id`) |
| `nickname` | `TEXT` | `NOT NULL` | Biệt danh người dùng đã chọn khi kích hoạt |
| `birth_year` | `INT` | | Năm sinh khảo sát (ví dụ: `2002`) |
| `birthdate` | `DATE` | | Ngày sinh chuẩn hóa (`YYYY-01-01`) |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm hoàn thành khảo sát |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm cập nhật khảo sát gần nhất |

**Chỉ mục tối ưu:**
- `idx_user_surveys_device`: `(device_id)`
- `idx_user_surveys_nickname`: `(lower(nickname))`
- `idx_user_surveys_birth_year`: `(birth_year)`

**RLS Policies:**
- `Anyone can insert or update own device survey`: `FOR ALL USING (true) WITH CHECK (true)` (Cho phép client không có Supabase JWT gửi khảo sát).

---

## 3. STORED FUNCTIONS & RPC CONTRACT

### 3.1. Hàm RPC: `public.check_nickname_available`
Kiểm tra tính khả dụng của biệt danh (không trùng với `profiles` và `user_surveys`), chạy dưới quyền `SECURITY DEFINER` để client ẩn danh không bị chặn bởi RLS.

```sql
CREATE OR REPLACE FUNCTION public.check_nickname_available(
    p_nickname TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
```

**Tham số đầu vào:**
- `p_nickname`: Chuỗi biệt danh cần kiểm tra (ví dụ: `'Cốm Non'`).

**Quy tắc nghiệp vụ:**
- Trả về `TRUE` nếu biệt danh chưa được đăng ký trong cả `profiles.full_name` và `user_surveys.nickname`.
- So khớp không phân biệt hoa thường (`lower(trim(...))`).
- Cấp quyền thực thi (`GRANT EXECUTE`) cho `anon` và `authenticated`.

### 3.2. Hàm RPC: `public.submit_age_survey`
Ghi nhận kết quả khảo sát độ tuổi và biệt danh an toàn từ thiết bị di động, tự động upsert theo `device_id`.

```sql
CREATE OR REPLACE FUNCTION public.submit_age_survey(
    p_device_id TEXT,
    p_nickname TEXT,
    p_birth_year INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
```

### 3.3. Hàm RPC: `public.get_monthly_spending_summary`
Tính toán tổng chi tiêu, tổng thu nhập và số lượng giao dịch của người dùng trong một tháng nhất định, chuẩn hóa múi giờ Việt Nam (`Asia/Ho_Chi_Minh` — UTC+7).

```sql
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
```

**Tham số đầu vào:**
- `p_user_id`: UUID của người dùng cần tổng hợp.
- `p_year`: Năm dương lịch (ví dụ: `2026`).
- `p_month`: Tháng dương lịch 1-12 (ví dụ: `10`).

**Quy tắc nghiệp vụ:**
- Tự động lọc các giao dịch có `status = 'CONFIRMED' OR status IS NULL` (Bỏ qua hoàn toàn giao dịch `PENDING` và `CANCELLED`).
- Tính toán chính xác từ 00:00:00 ngày đầu tháng đến 00:00:00 ngày đầu tháng sau theo múi giờ UTC+7.

---

## 4. QUY TẮC BẢO VỆ DỮ LIỆU & BẢO MẬT KHÁCH (GUEST GUARD CONTRACT)

1. **Chế Độ Dùng Ngay (Guest Mode):**
   - Người dùng chưa đăng nhập có `user_id` bắt đầu bằng tiền tố `guest-` (ví dụ `guest-1791180000000`).
   - Bộ phận `Guest Sync Guard` trong client tuyệt đối KHÔNG gửi bất kỳ API request nào lên Supabase Cloud khi người dùng đang ở phiên Guest (0 cloud writes).
2. **Làm Sạch Dữ Liệu Mẫu (Seed Data Cleanup):**
   - Khi người dùng đăng nhập tài khoản thật, toàn bộ dữ liệu mẫu ban đầu (`tx-seed-*`) bị loại bỏ hoàn toàn, chỉ các giao dịch thực sự phát sinh trong phiên Guest mới được di chuyển sang UUID thật.
3. **Làm Sạch EXIF Metadata Ảnh:**
   - Trước khi upload ảnh lên Supabase Storage qua bucket `receipt-photos`, client chạy qua thao tác làm sạch pixel thuần, loại bỏ 100% tọa độ GPS Latitude/Longitude, tên thiết bị, phần mềm và nhãn thời gian nhạy cảm.
