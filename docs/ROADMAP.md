# 🚀 LỘ TRÌNH PHÁT TRIỂN CHIẾN LƯỢC: PIGFLY (ROADMAP.MD)

> **Dự án:** PigFly (Ví Locket) — Mobile App Chi Tiêu Bằng Ảnh & Quét Mã QR  
> **Phiên bản:** NEW v4.0 (AI-First & Pop-Anime Gamification)  
> **Cập nhật:** Tháng 11/2026  
> **Quy ước trạng thái:** `[x]` Đã hoàn thành | `[/]` Đang triển khai | `[ ]` Chuẩn bị thực hiện

---

## 🏆 CÁC NỀN TẢNG ĐÃ HOÀN THÀNH (FOUNDATION ACHIEVED)

### 📌 Milestone M0: Trải Nghiệm Ghi Sổ 3 Giây Bằng Ảnh & VietQR (Hoàn tất 100%)
- [x] Kiến trúc Design System Hà Nội Thu Đông: Nền kem ngà `#FAF6EC`, xám trầm `#0E1620`, điểm nhấn nắng thu `#E59844`.
- [x] Tab 0 Sổ Nhật Ký (Home): Lịch ảnh 7 cột (tuần/tháng), thẻ `Hôm nay tiêu được` và thuật toán Rollover 100% kết chuyển số dư ngày.
- [x] Tab 2 Camera Photobooth (Trung tâm): Khung ngắm Locket 4:5, nút Shutter 1-chạm nhún xúc giác Haptics, chip giá nhanh $\le 3$s.
- [x] Quét mã VietQR Offline: Nhận diện chuẩn EMVCo quốc tế và NAPAS, tự động deeplink sang App ngân hàng chính thức với 0 rò rỉ STK.
- [x] Phân lập tuyệt đối các khoản `PENDING` (không tính vào ngân sách cho đến khi người dùng xác nhận).

### 📌 Milestone M1: Bảo Mật Native, Zero-STK Shield & Web PWA (Hoàn tất 100%)
- [x] Bóc tách biến động số dư Android Native 100% Offline (chặn 100% tin nhắn chứa OTP, mật khẩu).
- [x] Tiện ích Màn hình khóa Sticky Lock Screen banner theo dõi số dư và ghi nhanh 1-chạm.
- [x] Luồng Locket Bank Snapshot: Nhận thông báo ngân hàng $\rightarrow$ Mở camera ghim sẵn số tiền $\rightarrow$ Bấm chụp món đồ lưu kỷ niệm.
- [x] Xuất dữ liệu sao lưu CSV chuẩn UTF-8 BOM (`\uFEFF`) tương thích Excel và sao lưu JSON mã hóa.
- [x] Web PWA & CI/CD GitHub Actions: Tự động deploy lên GitHub Pages (`https://philipsgn.github.io/Kepi/`).

### 📌 Milestone M2: Chuyển Đổi Thương Hiệu PigFly & Hệ Thống 2 Theme Chuẩn WCAG (Hoàn tất 100%)
- [x] Chuyển đổi tên thương hiệu toàn diện sang **PigFly** với slogan: *"PigFly: Tiết kiệm – Duy trì – Sinh lời bền vững"*.
- [x] Gỡ bỏ triệt để lỗi linh vật đè chữ: Chuyển chú heo PigFly lên Greeting Header (Tab Home), làm sạch 100% khung ngắm 4:5 (Tab Camera).
- [x] Dọn sạch vĩnh viễn hardcode `~ khoảng 1 ly trà sữa` tại Tab Cá nhân (Profile).
- [x] Hệ thống 2 Theme độc bản: "Hồng Heo" (`pink` - Mặc định) và "Xanh Mint" (`mint` - Gradient đa tầng) đạt chuẩn WCAG AAA/AA.
- [x] Bộ kiểm thử tự động 53/53 tests PASSED 100% và TypeScript 0 lỗi.

---

## 🎯 CÁC CHẶNG CHIẾN LƯỢC TIẾP THEO (v4.0 WORKFLOW)

### 📌 GIAI ĐOẠN 1: PIGFLY v4.0 — AI-FIRST & GAMIFICATION ENGINE (ĐANG TRIỂN KHAI)
*Trọng tâm: Song song 2 luồng phát triển AI (OCR, Voice, Vision) và Gamification (ActiDoo Engine, Cờ Tỷ Phú, SOS Alarm).*

- [/] **1.1. Luồng AI-First (Dual-Scan, Voice & Vision):**
  - [ ] AI Receipt OCR Parser: Nhận diện hóa đơn retail Việt Nam, bóc tách đơn vị bán, danh sách món, tổng tiền.
  - [ ] Carousel Fallback UI: Cho phép chọn nhanh hoặc sửa tay các số tiền ứng viên trong $\le 3$s.
  - [ ] Voice-to-Expense NLP Parser: Bóc tách tiếng Việt tự nhiên ("Ăn bún bò 50 cành") $\to$ tiền, danh mục, icon.
  - [ ] On-Device Vision Tagging: Phân loại hình ảnh ngoại tuyến 100% (đồ ăn, mua sắm, di chuyển).
- [/] **1.2. Luồng Gamification Engine (ActiDoo Inspired):**
  - [ ] `gamificationStore.ts`: Quản lý FEP, 5 Tầng Mây, Mascot Mood, Kho Skin và Chuỗi Streak.
  - [ ] `rulesEngine.ts`: Đánh giá điều kiện rules, mở khóa thành tựu đa cấp độ (Bronze/Silver/Gold).
  - [ ] Mini-Game "Cờ Tỷ Phú Đầu Tư Tài Chính": Bàn cờ 16 ô thử thách tài chính (Né bẫy FOMO, Đầu tư tích lũy, Flashcards).
  - [ ] Mascot Lottie Animation: 4 trạng thái cảm xúc (`FLYING_HIGH`, `CHILL`, `PANIC`, `STARVING`).
- [/] **1.3. Luồng Squad 2.0 & Trực Quan Hóa Báo Cáo:**
  - [ ] Feed nội bộ thời gian thực hiển thị ảnh chi tiêu của nhóm 4 bạn thân.
  - [ ] SOS Overspending Alarm Protocol: Phát tín hiệu cầu cứu sang bạn bè khi chi tiêu vượt hạn mức ngày.
  - [ ] Bảng xếp hạng tuần (Squad Leaderboard) thi đua FEP và tỷ lệ tiết kiệm.
  - [ ] Báo cáo Magazine / Story Anime trong Tab Thống Kê (Runway Score, Impulse Ratio, Savings Velocity).
  - [ ] Android Native AppWidget ghim số dư và linh vật ra màn hình chính.

---

### 📌 GIAI ĐOẠN 2: SUPABASE CLOUD PRODUCTION & ĐỒNG BỘ ĐA THIẾT BỊ
*Trọng tâm: Khởi tạo hạ tầng Cloud an toàn tuyệt đối, đồng bộ dữ liệu thời gian thực.*

- [ ] **2.1. Cấu Hình Supabase Production:**
  - [ ] Chạy bộ migration hoàn chỉnh (`001` $\rightarrow$ `006_nickname_and_age_survey.sql`).
  - [ ] Cấu hình Row Level Security (RLS) cách ly dữ liệu nhiều người dùng.
- [ ] **2.2. Google Sign-In Native:**
  - [ ] Cấu hình Google Cloud Console OAuth Client IDs (Web, Android SHA-1, iOS URL Scheme).
  - [ ] Luồng đăng nhập 1 chạm an toàn, hỗ trợ chuyển đổi từ tài khoản Khách (Guest) sang Google giữ nguyên toàn bộ dữ liệu.
- [ ] **2.3. Lưu Trữ Hình Ảnh Đám Mây Đa Tầng:**
  - [ ] Tự động nén WebP dual-resolution trước khi upload Supabase Storage (ảnh gốc 1080px và thumbnail 240px).
  - [ ] Cơ chế đồng bộ 2 chiều Realtime: Mở app trên iPad hoặc đổi điện thoại mới tải lại toàn bộ nhật ký ngay lập tức.

---

### 📌 GIAI ĐOẠN 3: ĐÓNG GÓI NATIVE BUILD EAS & PHÁT HÀNH STORE
*Trọng tâm: Đưa PigFly lên Google Play Store và Apple App Store.*

- [ ] **3.1. Native Android Plugin & Widget:**
  - [ ] Đóng gói AppWidget Android vào APK/AAB sản xuất.
  - [ ] Cấu hình `NotificationListenerService` đọc biến động số dư tự động trong file build.
- [ ] **3.2. Native iOS WidgetKit Extension:**
  - [ ] Xây dựng Swift WidgetKit Extension hiển thị chú heo PigFly và số dư `Hôm nay tiêu được` trên màn hình khóa iOS 16+.
- [ ] **3.3. Kiểm Toán Bảo Mật & Phát Hành Ứng Dụng:**
  - [ ] Kiểm toán 0 rò rỉ STK theo tiêu chuẩn Apple App Store Guideline 5.1.1 (Privacy).
  - [ ] Đóng gói EAS Build Production và phát hành bản Beta trên TestFlight & Google Play Internal Testing.
  - [ ] Ra mắt chính thức trên App Store & CH Play.
