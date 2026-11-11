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

## 🎯 CÁC CHẶNG CHIẾN LƯỢC TIẾP THEO (v4.1 WORKFLOW)

### 📌 GIAI ĐOẠN 1: PIGFLY v4.1 — AI-FIRST & GAMIFICATION ENGINE (HOÀN TẤT 100%)
*Trọng tâm: Song song 2 luồng phát triển AI (OCR, Voice, Vision) và Gamification (ActiDoo Pure Rules, Cờ Tỷ Phú, Mascot Lottie Moods).*

- [x] **1.1. Luồng AI-First (Dual-Scan, Voice & Vision) — Hoàn tất 100%:**
  - [x] AI Receipt OCR Parser: Nhận diện hóa đơn retail Việt Nam, bóc tách đơn vị bán, danh sách món, tổng tiền (`src/utils/ai/receiptOcrParser.ts`).
  - [x] Carousel Fallback UI: Cho phép chọn nhanh hoặc sửa tay các số tiền ứng viên trong $\le 3$s trên `LocketReviewModal.tsx`.
  - [x] Voice-to-Expense NLP Parser: Bóc tách tiếng Việt tự nhiên ("Ăn bún bò 50 cành") $\to$ tiền, danh mục, icon (`src/utils/ai/voiceExpenseParser.ts` & `CompactVoiceWaveSheet.tsx`).
  - [x] On-Device Vision Tagging: Phân loại hình ảnh ngoại tuyến 100% (`src/utils/ai/visionClassifier.ts`).
- [x] **1.2. Luồng Gamification Engine (Chuỗi Streak & Mascot Loop — Zero Virtual Points) — Hoàn tất 100%:**
  - [x] `gamificationStore.ts` & `rulesEngine.ts`: Quản lý 5 Tầng Mây theo Streak, Mascot Mood, Quyết định 112 (Bỏ hoàn toàn FEP ảo).
  - [x] Mini-Game "Cờ Tỷ Phú Đầu Tư Tài Chính": Bàn cờ 16 ô thử thách tài chính (`monopolyBoardEngine.ts`, `FinancialMonopolyModal.tsx`).
  - [x] Mascot Lottie Animation: 4 trạng thái cảm xúc (`FLYING_HIGH`, `CHILL`, `PANIC`, `STARVING`) trên Greeting Header Home (`PigFlyLottieMascot.tsx`).
  - [x] Android Native AppWidget Config Plugin (`plugins/withAppWidget.js`).

---

### 📌 GIAI ĐOẠN 2 (MILESTONE M3): OFFLINE-FIRST ROCK-SOLID ENGINE (TRỌNG TÂM SỐ 1 - ĐANG TRIỂN KHAI)
*Trọng tâm: Ưu tiên tuyệt đối trải nghiệm ngoại tuyến. Cho phép người dùng ra đường không có mạng 4G/Wifi vẫn chụp ảnh, ghi sổ, quét OCR hóa đơn và voice NLP mượt mà.*

- [x] **2.1. Động Cơ Lưu Trữ Hình Ảnh Bền Vững Ngoại Tuyến (Offline Persistence Engine):**
  - [x] Lưu trữ ảnh WebP nén (~50KB/ảnh, nén 95%) và thumbnail (240px) vĩnh viễn vào `DocumentDirectory` (`pigfly_photos/{YYYY-MM}/{txId}.webp`).
  - [x] Bảo vệ ảnh không bao giờ bị hệ điều hành dọn dẹp bộ nhớ xóa nhầm khi điện thoại đầy dung lượng.
  - [x] Cô lập thuật toán dọn dẹp cache `cleanOldPhotoCache` chỉ dọn file tạm trong `cacheDirectory`.
- [x] **2.2. Bộ Công Cụ Nhập Liệu AI Ngoại Tuyến $\le 3$s:**
  - [x] AI Receipt OCR Scanner với Carousel Fallback $\le 3$s.
  - [x] Voice-to-Expense NLP tiếng Việt tự nhiên $\le 2$s.
  - [x] On-Device Vision Classifier nhận diện đối tượng tiêu dùng.
- [/] **2.3. Phân Hệ Trực Quan Hóa Báo Cáo Anime & Squad 2.0 (Offline-First):**
  - [/] Báo cáo Magazine Anime trong Tab Thống Kê (`AnimeMagazineReportSheet.tsx` hiển thị 3 KPI mới: Runway Score, Impulse Ratio, Savings Velocity).
  - [/] Đặt lối tắt mở Bàn cờ Cờ Tỷ Phú độc quyền trong Tab 3 (Squad Room) phục vụ sinh hoạt nhóm bạn thân.
  - [/] SOS Overspending Alarm Protocol: Tự động kích hoạt còi cảnh báo cứu ví trong Squad Room khi người dùng chi tiêu vượt hạn mức ngày.
  - [x] Bảng xếp hạng tuần (Squad Leaderboard) thi đua tỷ lệ tiết kiệm và chuỗi ngày kỷ luật.
- [x] **2.4. Tiện Ích Native & Két Sao Lưu Cục Bộ (Offline Vault):**
  - [x] Android Native AppWidget Config Plugin ghim số dư và linh vật.
  - [x] Xuất / Nhập sao lưu toàn diện định dạng JSON & CSV (UTF-8 BOM).

---

### 📌 GIAI ĐOẠN 3 (MILESTONE M4): SUPABASE CLOUD READY & MULTI-DEVICE SYNC (TÍCH HỢP SAU KHI M3 ỔN ĐỊNH HOÀN TOÀN)
*Trọng tâm: Chỉ kích hoạt sau khi hệ thống Offline-First M3 đã hoạt động hoàn toàn ổn định. Đám mây đóng vai trò lớp Adapter mở rộng (Extension Layer).*

- [ ] **3.1. Supabase Cloud Database & Storage Adapter:**
  - [ ] Outbox Sync Worker đồng bộ ngầm 2 chiều khi có mạng (Zero-distraction, không ảnh hưởng thao tác offline).
  - [ ] Supabase PostgreSQL Database, Storage Bucket (`receipt-photos`) và RLS Multi-User Isolation.
  - [ ] Quản lý phiên đăng nhập đa thiết bị (Đồng bộ iPad / Điện thoại mới).
- [ ] **3.2. Cloud Aggregation & Kỷ Niệm Locket:**
  - [ ] Xử lý luồng tổng hợp dữ liệu lớn, tạo video recap và album kỷ niệm tự động (tương tự kiến trúc Locket gốc).

---

### 📌 GIAI ĐOẠN 4 (MILESTONE M5): ĐÓNG GÓI NATIVE BUILD EAS & PHÁT HÀNH STORE
*Trọng tâm: Đưa PigFly lên Google Play Store và Apple App Store.*

- [ ] **4.1. Native Android Plugin & Widget:**
  - [ ] Đóng gói AppWidget Android vào APK/AAB sản xuất.
  - [ ] Cấu hình `NotificationListenerService` đọc biến động số dư tự động trong file build.
- [ ] **4.2. Native iOS WidgetKit Extension:**
  - [ ] Xây dựng Swift WidgetKit Extension hiển thị chú heo PigFly và số dư `Hôm nay tiêu được` trên màn hình khóa iOS 16+.
- [ ] **4.3. Kiểm Toán Bảo Mật & Phát Hành Ứng Dụng:**
  - [ ] Kiểm toán 0 rò rỉ STK theo tiêu chuẩn Apple App Store Guideline 5.1.1 (Privacy).
  - [ ] Đóng gói EAS Build Production và phát hành bản Beta trên TestFlight & Google Play Internal Testing.
  - [ ] Ra mắt chính thức trên App Store & CH Play.
