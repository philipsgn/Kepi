# LỘ TRÌNH PHÁT TRIỂN SẢN PHẨM (ROADMAP.MD)

> **Dự án:** Kepi (Ví Locket) — Mobile App Chi Tiêu Bằng Ảnh & Quét Mã QR  
> **Cập nhật:** 2026-10-05  
> **Quy ước trạng thái:** `[x]` Đã hoàn thành | `[/]` Đang tiến hành | `[ ]` Chưa bắt đầu

---

## 🎯 CÁC CỘT MỐC CHÍNH (MILESTONES)

### 📌 Giai đoạn M0: Ra Mắt Tối Thiểu (Foundation MVP)
- [x] Kiến trúc Design System Sáng/Tối (Kem ngà #FAF6EC, xám xanh #0E1620, vàng thu #E59844, viền hairline 1px).
- [x] Trang 1: Sổ Nhật Ký (Home / JournalView) — Lịch ảnh 7 cột, thẻ "Hôm nay tiêu được".
- [x] Trang 2: Camera Photobooth — Nút Shutter tròn đồng tâm 1 chạm, chụp ảnh, chip giá nhanh $\le 3$s, lướt xem Lịch sử ngày.
- [x] Trang 3: Chat Bạn Bè & Anh Minh Cố Vấn Tĩnh Tâm — Trò chuyện tài chính thời gian thực với Gemini AI.
- [x] Trang 4: Thống Kê (Stats) — Album ảnh tách theo tháng, thanh đo ngân sách.
- [x] Trang 5: Hồ Sơ (Profile) — Thiết lập cá nhân, hạn mức ngày, xóa dữ liệu 1 chạm.
- [/] **Nâng cấp Camera: Quét mã chuyển khoản VietQR (Production QR Pay):**
  - [x] **Giai đoạn A (Tài liệu):** Lập đặc tả `QR_PAY.md`, `EMV_PARSER_SPEC.md`, `BANK_DEEPLINK_MATRIX.md`, cập nhật `PAGES_FEATURES.md`, `TECH_ARCHITECTURE.md`, `DECISIONS.md`, `PRIVACY_POLICY_DRAFT.md`.
  - [x] **Giai đoạn S (Thử nghiệm máy thật):** Kiểm chứng deeplink Techcombank Mobile trên iPhone thật, xác nhận hành vi mở trang chủ, kích hoạt phương án dự phòng 7.5.
  - [x] **Giai đoạn B (Cài đặt hoàn thiện):** Tích hợp camera barcode scanner, parser offline, thẻ trượt VietQR Polaroid, deeplink mở Techcombank, thẻ hỏi "Đã chuyển xong chưa?", cài đặt Hồ sơ `QRPaySettingsCard`.
  - [x] **Giai đoạn C (Kiểm chứng):** 9/9 test suites (69/69 tests PASS 100%), kiểm chứng cách ly PENDING/CANCELLED, zero account leakage, lint sạch 0 lỗi.
  - [x] **Giai đoạn D (Bàn giao):** Báo cáo walkthrough chi tiết, hướng dẫn nghiệm thu thực tế trên iPhone.

---

### 📌 Giai đoạn M1: Giữ Chân, An Toàn & Trải Nghiệm Cao Cấp (ĐÃ HOÀN THÀNH 100%)
- [x] Nhập mã QR từ ảnh chụp màn hình trong Thư viện ảnh (dùng chung bộ đọc EMV offline).
- [x] Bảo mật sinh trắc học: Khóa app bằng Face ID / Touch ID / Mã PIN (`LockScreenModal`).
- [x] Đồng bộ đám mây Supabase đa thiết bị: Google Sign-In & Email OTP 6 số (`authStore`).
- [x] Lưu trữ hình ảnh Cloud WebP dual-resolution & Realtime sync 2 chiều với Supabase.
- [x] Tiện ích Màn hình khóa ghim số dư & trừ tiền 1 chạm (`[-30k]`, `[-50k]`, `[Hoàn tác]`).
- [x] Quy đổi lương giờ công & Xuất dữ liệu CSV chuẩn UTF-8 BOM (`\uFEFF`).
- [x] In-app Data Analytics Dashboard trong Tab Thống Kê (3 KPI Sức khỏe Tài chính).
- [x] Nhận diện Ví điện tử ZaloPay / MoMo qua whitelist URL & hàng chờ PENDING.
- [x] Nâng cấp bộ 3 Theme WOW độc bản: Sáng (Warm Luxury Gold), Tối (Space Gray Titanium), Mát (Cool Mint & Aqua Jade).

---

### 📌 Giai đoạn M2: Danh Mục Tùy Biến & Dòng Tiền Tự Động (Custom Categories & Continuous Flow)
- [ ] **M2.1: Custom Categories Engine (Danh mục Tùy Biến Thu & Chi):**
  - [ ] Phân tách rõ ràng hai luồng: Danh mục **CHI TIÊU** vs Danh mục **THU NHẬP**.
  - [ ] Bộ danh mục mặc định chuẩn đời sống (Ăn uống, Nhà cửa, Xe cộ, Thuốc men, Cho mẹ, Nuôi pet, Lương, Thưởng...).
  - [ ] Giao diện quản lý danh mục chuyên nghiệp trong tab Hồ Sơ (Thêm, Sửa tên, Chọn Icon `lucide-react-native`, Đổi màu sắc, Ẩn/Hiện).
  - [ ] Lối tắt tạo nhanh danh mục mới (`+ Tạo danh mục`) ngay tại Bottom Sheet ghi chép.
- [ ] **M2.2: Continuous Running Balance & Auto Monthly Archive (Dòng Tiền Liên Tục & Chuyển Kỳ Tự Động):**
  - [ ] Cơ chế Số Dư Dòng Tiền Liên Tục (`Running Balance`): Số dư cuối tháng cũ tự động kết chuyển tiếp nối sang đầu tháng mới (như tài khoản ngân hàng thực tế).
  - [ ] Tự động hóa 100% chuyển kỳ tháng: Vào 00:00 ngày đầu tháng, hệ thống tự động lưu trữ mốc Báo cáo tháng cũ vào tab Thống Kê và mở chu kỳ tháng mới (tuyệt đối 0 bắt người dùng reset thủ công).
- [x] ~~**Giao dịch định kỳ tự động:**~~ *Đã chính thức loại bỏ theo Quyết định #28 để bảo vệ tính chân thực của thời gian và ảnh chụp thực tế.*

---

### 📌 Lộ Trình Thương Mại Hóa Production (Production & Market Launch)
- [x] **Phase P0: Hiện Thực Hóa Tính Năng Chuẩn Production (Đã hoàn tất):**
  - [x] Gỡ bỏ hoàn toàn HLV Anh Minh khỏi Tab Cài Đặt (tập trung duy nhất ở Tab 3 Chat).
  - [x] Bỏ hoàn toàn Khóa Face ID để tối ưu dữ liệu và hiệu năng ứng dụng.
  - [x] Kích hoạt Nhận diện biến động số dư qua Sao chép (Clipboard Auto-Detection) cho 8+ ngân hàng.
  - [x] Kích hoạt Thanh Tiện ích Khóa Sticky tương tác 1-chạm (`[-30k]`, `[-50k]`, `[Chụp]`, `[Hoàn tác]`) trên Android.
  - [x] Xây dựng Hệ thống Sao lưu & Khôi phục dữ liệu tự chủ (Export/Import JSON) bảo mật 100%.
  - [x] Chuyển đổi 100% các huy hiệu sang trạng thái "Khả dụng" (#10B981) trên Tab Cài Đặt.
  - [x] Xóa bỏ 100% hardcode username, fallback tiền ngầm và 7 giao dịch mẫu demo.
- [x] **Phase P0.5: Trải Nghiệm Ghi Chép Biến Động Số Dư Vượt Bậc (Locket Bank Snapshot & Full-Category Fast Log — Hoàn tất):**
  - [x] Nâng cấp thanh `BankClipboardToast` với 2 nút hành động: `[📸 Chụp Locket]` và `[⚡ Ghi Nhanh]`.
  - [x] Kích hoạt luồng Locket Snapshot: Mở Camera 4:5 ghim sẵn số tiền/ngân hàng, bấm Shutter chụp món đồ $\rightarrow$ lưu kèm ảnh.
  - [x] Xây dựng Fast Category Sheet: Hiển thị ĐẦY ĐỦ danh mục (hệ thống & tùy biến) để gán 1-chạm không cần gõ chữ.
  - [x] Chuẩn hóa tên giao dịch: Tự động dùng tên Danh mục + tag ngân hàng, loại bỏ rác chữ nội dung chuyển khoản thô.
  - [x] Tích hợp Push Notification tương tác ngoài màn hình khóa (`LOCK_SCREEN_CATEGORY_BANK_ALERT`) với 2 nút `[📸 Chụp Locket]` và `[⚡ Ghi Nhanh]`.
- [ ] **Phase P1: Hạ Tầng Supabase Cloud & Google OAuth Thực Tế:**
  - [ ] Khởi tạo dự án Supabase Production, chạy SQL schema chính thức.
  - [ ] Cấu hình `.env` cho `EXPO_PUBLIC_SUPABASE_URL` và `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
  - [ ] Cấu hình Google Cloud Console OAuth Client ID cho iOS/Android.
  - [ ] Đồng bộ dữ liệu đa thiết bị 2 chiều cho người dùng đăng nhập Google thật.
- [ ] **Phase P2: Đóng Gói Native Build EAS (Widget Màn Hình Khóa & Background Listener):**
  - [ ] Xây dựng Android Config Plugin cho `NotificationListenerService` đọc biến động số dư tự động trong file build APK.
  - [ ] Xây dựng Swift WidgetKit Extension cho iOS và AppWidget cho Android ghim số dư ra màn hình khóa OS.
- [ ] **Phase P3: Kiểm Toán Bảo Mật E2E & Phát Hành Store (App Store & CH Play):**
  - [ ] Tối ưu FPS 60fps mượt mà, kiểm toán 0 rò rỉ STK theo Apple Guideline 5.1.1.
  - [ ] Đóng gói và phát hành ứng dụng lên App Store và Google Play.

---

### 📌 Giai đoạn M3: Bạn Bè & Chia Sẻ (Social & Friends)
- [ ] Ngăn Bạn bè trong Chat: Cùng bạn bè theo dõi ngân sách tuần.
- [ ] Hỏi ý kiến bạn bè trước khi bấm mua một món đồ đắt tiền ("Nên mua không?").
- [ ] Locket Feed: Xem album chi tiêu của nhóm bạn thân thiết.

