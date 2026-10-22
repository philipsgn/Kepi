# 🔐 HƯỚNG DẪN CẤU HÌNH ĐĂNG NHẬP GOOGLE OAUTH TRÊN SUPABASE (0$)

> **Dự án:** Kepi (Ví Locket)  
> **Thời gian thực hiện:** ~ 3 phút  
> **Chi phí:** 0$ (Hoàn toàn miễn phí trên Google Cloud & Supabase Free Tier)

---

## 📌 BƯỚC 1: TẠO OAUTH 2.0 (OAuth 2.0) CREDENTIALS TRÊN GOOGLE CLOUD CONSOLE

1. Truy cập vào **[Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)**.
2. Chọn hoặc tạo một Project mới (ví dụ: `Kepi Mobile`).
3. Vào mục **OAuth consent screen** (Màn hình đồng ý OAuth):
   - Chọn **User Type:** `External` (Bên ngoài) $\rightarrow$ Bấm **Create**.
   - **App name:** `Kepi`
   - **User support email:** Chọn email của bạn.
   - **Developer contact information:** Nhập email của bạn $\rightarrow$ Bấm **Save and Continue**.
   - Mục **Scopes:** Bấm **Save and Continue** (mặc định lấy `email`, `profile`, `openid`).
4. Vào mục **Credentials** (Thông tin xác thực) $\rightarrow$ Bấm **+ CREATE CREDENTIALS** $\rightarrow$ Chọn **OAuth client ID**:
   - **Application type:** Chọn `Web application`.
   - **Name:** `Kepi Web & Mobile Client`.
   - **Authorized redirect URIs (URI chuyển hướng được phép):**
     - Thêm URI callback của Supabase:
       ```
       https://yohzbxywumczegtifvfl.supabase.co/auth/v1/callback
       ```
   - Bấm **CREATE**.
5. Hộp thoại hiện ra: Sao chép (Copy) lại **Client ID** và **Client Secret**.

---

## 📌 BƯỚC 2: BẬT GOOGLE PROVIDER TRÊN SUPABASE DASHBOARD

1. Đăng nhập vào trang quản trị Supabase của dự án:  
   👉 **[https://supabase.com/dashboard/project/yohzbxywumczegtifvfl/auth/providers](https://supabase.com/dashboard/project/yohzbxywumczegtifvfl/auth/providers)**
2. Tìm đến mục **Google** trong danh sách Authentication Providers.
3. Bật công tắc **Enable Sign in with Google** thành **ON**.
4. Dán 2 thông tin đã lấy từ Bước 1:
   - **Client ID (for OAuth):** `<Dán Client ID của bạn>`
   - **Client Secret (for OAuth):** `<Dán Client Secret của bạn>`
5. Bấm nút **Save** ở góc dưới.

---

## 📌 BƯỚC 3: CẤU HÌNH URL CHUYỂN HƯỚNG (REDIRECT URLS)

1. Cũng tại Supabase, vào mục **Authentication** $\rightarrow$ **URL Configuration**:  
   👉 **[https://supabase.com/dashboard/project/yohzbxywumczegtifvfl/auth/url-configuration](https://supabase.com/dashboard/project/yohzbxywumczegtifvfl/auth/url-configuration)**
2. Tại mục **Site URL**, nhập:
   ```
   http://localhost:8081
   ```
   *(hoặc domain web/production của bạn)*
3. Tại mục **Redirect URLs**, bấm **Add URL** và thêm các URL sau:
   - `http://localhost:8081`
   - `http://localhost:8081/**`
   - `exp://**` (Hỗ trợ Expo Go khi test trên điện thoại)
   - `vilocket://*`
4. Bấm **Save**.

---

## 🎉 HOÀN TẤT
Bây giờ ứng dụng Kepi có thể mở trực tiếp cửa sổ chọn tài khoản Google trên Web và Mobile. Người dùng đầu tiên đăng nhập bằng Gmail sẽ trở thành User #1 chính chủ!
