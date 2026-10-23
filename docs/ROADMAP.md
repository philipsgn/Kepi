# 🚀 LỘ TRÌNH PHÁT TRIỂN CHIẾN LƯỢC: PIGFLY (ROADMAP.MD)

> **Dự án:** PigFly (Ví Locket) — Mobile App Chi Tiêu Bằng Ảnh & Quét Mã QR  
> **Phiên bản:** NEW v3.0  
> **Cập nhật:** Tháng 10/2026  
> **Quy ước trạng thái:** `[x]` Đã hoàn thành | `[/]` Đang triển khai | `[ ]` Chuẩn bị thực hiện

---

## 🏆 CÁC NỀN TẢNG ĐÃ HOÀN THÀNH (FOUNDATION ACHIEVED)

### 📌 Milestone M0: Trải Nghiệm Ghi Sổ 3 Giây Bằng Ảnh & VietQR (Hoàn tất 100%)
- [x] Kiến trúc Design System Hà Nội Thu Đông: Nền kem ngà `#FAF6EC`, xám trầm `#0E1620`, điểm nhấn nắng thu `#E59844`.
- [x] Tab 0 Sổ Nhật Ký (Home): Lịch ảnh 7 cột (tuần/tháng), thẻ `Hôm nay tiêu được` và thuật toán Rollover 100% kết chuyển số dư ngày.
- [x] Tab 2 Camera Photobooth (Trung tâm): Khung ngắm Locket 4:5, nút Shutter 1-chạm nhún xúc giác Haptics, chip giá nhanh $\le 3$s.
- [x] Quét mã VietQR Offline: Nhận diện chuẩn EMVCo quốc tế và NAPAS, tự động deeplink sang App ngân hàng chính thức với 0 rò rỉ STK.
- [x] Phân lập tuyệt đối các khoản `PENDING` (không tính vào ngân sách cho đến khi người dùng xác nhận).

### 📌 Milestone M1: Bảo Mật Native & Zero-STK Shield (Hoàn tất 100%)
- [x] Bóc tách biến động số dư Android Native 100% Offline (chặn 100% tin nhắn chứa OTP, mật khẩu).
- [x] Tiện ích Màn hình khóa Sticky Lock Screen banner theo dõi số dư và ghi nhanh 1-chạm.
- [x] Luồng Locket Bank Snapshot: Nhận thông báo ngân hàng $\rightarrow$ Mở camera ghim sẵn số tiền $\rightarrow$ Bấm chụp món đồ lưu kỷ niệm.
- [x] Xuất dữ liệu sao lưu CSV chuẩn UTF-8 BOM (`\uFEFF`) tương thích Excel và sao lưu JSON mã hóa.
- [x] Bộ 3 Theme giao diện độc bản: Hà Nội Thu Đông (Mặc định), Không Gian Đêm Titanium (Tối), và Xanh Bạc Hà (Mát).

### 📌 Milestone M2: Chuyển Đổi Thương Hiệu PigFly & Tinh Gọn Giao Diện (Hoàn tất 100%)
- [x] Chuyển đổi tên thương hiệu toàn diện sang **PigFly** với slogan: *"PigFly: Tiết kiệm – Duy trì – Sinh lời bền vững"*.
- [x] Gỡ bỏ triệt để lỗi linh vật đè chữ: Chuyển chú heo PigFly lên Greeting Header (Tab Home), làm sạch 100% khung ngắm 4:5 (Tab Camera).
- [x] Dọn sạch vĩnh viễn hardcode `~ khoảng 1 ly trà sữa` tại Tab Cá nhân (Profile).
- [x] Xóa bỏ các card rác (`Đang ghim`, `Trừ ngầm`), nâng cấp 3 Detail Sheet bảo mật Zero-STK minh bạch tại Tab Cài đặt.
- [x] Bộ kiểm thử tự động 51/51 tests PASSED 100% và TypeScript 0 lỗi.

---

## 🎯 CÁC CHẶNG CHIẾN LƯỢC TIẾP THEO (NEW WORKFLOW)

### 📌 GIAI ĐOẠN 1: PIGFLY GAMIFICATION & SQUAD ROOM (ĐANG TRIỂN KHAI)
*Trọng tâm: Biến việc quản lý chi tiêu thành một trải nghiệm giải trí nhẹ nhàng, tạo động lực mở app mỗi ngày.*

- [ ] **1.1. Hệ Thống Năng Lượng Bay (Fly Energy Points - FEP):**
  - [ ] Tích hợp tính điểm FEP tự động: Ghi chép đúng hạn mức ngày (`+100 FEP`), chụp ảnh món đồ (`+30 FEP`).
  - [ ] Hệ số nhân chuỗi Streak: Thưởng thêm điểm năng lượng khi duy trì chuỗi 3, 7, 30 ngày.
  - [ ] Hiển thị thanh năng lượng bay lơ lửng của PigFly tại Header Tab Home.
- [ ] **1.2. Hệ Thống 5 Tầng Mây Tài Chính:**
  - [ ] Hiển thị tầng mây hiện tại của người dùng (Mây Non $\rightarrow$ Tự Do Tài Chính).
  - [ ] Hiệu ứng chuyển tầng mây rực rỡ khi người dùng kết chuyển số dư dương vào cuối ngày.
- [ ] **1.3. Mini-Game "PigFly: Vỗ Cánh Gom Tiền" (Tap-to-Fly):**
  - [ ] Xây dựng màn hình Mini-game thư giãn 60 giây với engine vật lý mềm (`react-native-reanimated`).
  - [ ] Cơ chế Tap-to-Fly gom đồng xu vàng, nhặt búp cốm non và tránh chướng ngại vật "FOMO Sập Sàn".
  - [ ] Mở khóa Skin trang phục ngộ nghĩnh cho chú heo PigFly (Mũ beret, Kính phi công, Balo chong chóng).
- [ ] **1.4. Mở Rộng Tính Năng Squad Nuôi Heo PigFly:**
  - [ ] Chia sẻ mã mời phòng (QR Code & Deep link `pigfly://squad/join?code=...`).
  - [ ] Hiệu ứng tương tác: Hoạt ảnh "👉 Nhắc đói" và "🎉 Vỗ béo heo bạn bè".

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
  - [ ] Xây dựng Expo Config Plugin cho `NotificationListenerService` đọc biến động số dư tự động trong file build APK/AAB.
  - [ ] Xây dựng AppWidget Android ghim số dư hôm nay ra màn hình chính điện thoại.
- [ ] **3.2. Native iOS WidgetKit Extension:**
  - [ ] Xây dựng Swift WidgetKit Extension hiển thị chú heo PigFly và số dư `Hôm nay tiêu được` trên màn hình khóa iOS 16+.
- [ ] **3.3. Kiểm Toán Bảo Mật & Phát Hành Ứng Dụng:**
  - [ ] Kiểm toán 0 rò rỉ STK theo tiêu chuẩn Apple App Store Guideline 5.1.1 (Privacy).
  - [ ] Đóng gói EAS Build Production và phát hành bản Beta trên TestFlight & Google Play Internal Testing.
  - [ ] Ra mắt chính thức trên App Store & CH Play.
