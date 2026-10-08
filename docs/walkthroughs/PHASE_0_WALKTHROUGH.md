# 🍂 WALKTHROUGH BÁO CÁO: PHASE 0 — NỀN TẢNG, DESIGN SYSTEM & SUPABASE

- **Dự án:** Ví Locket (Mobile App Chi Tiêu Ảnh & Giọng Nói — Vibe Hà Nội Thu Đông)
- **Giai đoạn:** Phase 0 (Foundation Setup)
- **Ngày hoàn thành:** 01/10/2026
- **Trạng thái:** ✅ Đã hoàn thành 100% mục tiêu, sẵn sàng chuyển sang Phase 1.

---

## 1. CÁC TASKS ĐÃ HOÀN THÀNH

- [x] **Task 0.1: Khởi tạo dự án Expo SDK 52 & Dependencies**
  - Cấu hình [package.json](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/package.json) với Expo SDK 52.0.37, React 18.3.1, React Native 0.76.7, Expo Router 4.
  - Cài đặt đầy đủ các package Native cốt lõi: `expo-camera`, `expo-av`, `expo-haptics`, `expo-notifications`, `react-native-reanimated`, `lucide-react-native`, `zustand`, `@supabase/supabase-js`.
  - Cấu hình [app.json](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/app.json) với đầy đủ quyền hạn (Camera, Microphone, Notifications) và theme Sữa Ngà (`#FAF6F0`).
  - Thiết lập [tsconfig.json](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/tsconfig.json) với strict mode và path alias `@/*`.

- [x] **Task 0.2: Xây dựng Design System chuẩn Hà Nội Thu Đông**
  - [src/constants/colors.ts](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/constants/colors.ts): Bảng màu Nắng Thu Gold (`#E59844`), Cốm Làng Vòng Mint (`#7E9F80`), Sữa Ngà (`#FAF6F0`), Khói Trầm Đêm Đông (`#1A1D1A`), Ngói Rêu Phố Cổ (`#C86D51`), Cúc Họa Mi Amber (`#D99B43`).
  - [src/constants/typography.ts](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/constants/typography.ts): Thang đo kiểu chữ, hỗ trợ `fontVariant: ['tabular-nums']` chống giật số tiền.
  - [src/constants/layout.ts](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/constants/layout.ts): Spacing, Border radiuses, Soft/Paper/Floating Shadows.
  - Xây dựng 3 core components dùng chung:
    - [src/components/common/FrostedPill.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/components/common/FrostedPill.tsx): Viên thuốc kính mờ lơ lửng hiển thị trạng thái ngân sách (`🟢 Còn 95k`, `🟡 Còn 25k`, `🔴 Lố 40k`).
    - [src/components/common/AutumnButton.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/components/common/AutumnButton.tsx): Nút bấm có hiệu ứng phản hồi xúc giác Haptics và 5 variants (`primary`, `safe`, `danger`, `outline`, `ghost`).
    - [src/components/common/HanoiCard.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/components/common/HanoiCard.tsx): Thẻ bề mặt giấy dó ấm áp với header và badge.

- [x] **Task 0.3: Supabase Backend & Database Migrations**
  - [supabase/migrations/001_initial_schema.sql](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/supabase/migrations/001_initial_schema.sql): Tạo 5 bảng PostgreSQL (`profiles`, `financial_settings`, `transactions`, `wait_basket`, `daily_budget_logs`) với RLS Policies đầy đủ.
  - Cấu hình Storage Bucket bảo mật `item-photos`.
  - [src/services/supabase.ts](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/services/supabase.ts): Supabase singleton client tích hợp AsyncStorage session persistence.
  - [src/types/database.ts](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/types/database.ts): Type definitions chuẩn TypeScript cho các model.
  - [src/utils/currency.ts](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/utils/currency.ts): Bộ hàm format VNĐ và tính toán ngân sách ngày Rollover 100%.

- [x] **Task 0.4: Màn hình Showcase & Kiểm thử Xác thực**
  - [app/_layout.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/app/_layout.tsx): Root layout Expo Router với StatusBar và theme Sữa Ngà.
  - [app/index.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/app/index.tsx): Màn hình Showcase trực quan hóa toàn bộ Design System, Hero Metric Tiền Đã Cứu, Buttons và Frosted Pills.

---

## 2. MINH CHỨNG HOẠT ĐỘNG & KẾT QUẢ KIỂM THỬ

* **TypeScript Compilation:**
  - Lệnh: `npx tsc --noEmit`
  - Kết quả: **0 errors, 0 warnings** (Exit Code 0).
* **Cấu hình Expo:**
  - Lệnh: `npx expo config --type public`
  - Kết quả: **Valid 100%** — Các plugin camera, av, notifications được parse chính xác.
* **Unit Test Thuật toán Ngân sách Rollover 100%:**
  - Lệnh: `node scripts/test-budget-logic.js`
  - Kết quả:
    - *Thu nhập 8 củ, Cố định 3 củ, Tiết kiệm 2 củ $\rightarrow$ Ngân sách ngày cơ sở: 100.000đ* (PASS)
    - *Hôm qua dư 60k $\rightarrow$ Hôm nay được tiêu: 160.000đ (Cộng dồn 100%)* (PASS)
    - *Hôm qua lố 40k $\rightarrow$ Hôm nay còn: 60.000đ (Trừ bù 100%)* (PASS)
    - *Format gọn 45.000đ $\rightarrow$ 45k; 1.200.000đ $\rightarrow$ 1.2 củ* (PASS)

---

## 3. CÁC QUYẾT ĐỊNH KIẾN TRÚC ĐÃ ĐƯA RA

1. **Thư viện Thu Âm & Camera:**
   - Sử dụng `expo-camera` và `expo-av` tương thích cao nhất với Expo SDK 52 và chuẩn New Architecture.
2. **Quy tắc Rollover 100% có Sàn an toàn:**
   - Luôn đặt mức sàn tối thiểu $20.000đ - 30.000đ/ngày$ trong thuật toán để dù người dùng có lố nặng hôm trước, hôm sau vẫn có một số tiền nhỏ tượng trưng, tránh gây cảm giác tuyệt vọng bỏ app.
3. **Design Tokens Nhất Quán:**
   - Tuyệt đối cô lập các mã màu vào `src/constants/colors.ts`, mọi component đều tham chiếu qua token để thuận tiện cho việc bổ sung Dark Mode ở các Phase sau.

---

## 4. KẾ HOẠCH CHO PHASE KẾ TIẾP (PHASE 1)

Sẵn sàng chuyển sang **Phase 1: Authentication & Wizard Thiết Lập Ngân Sách**:
- Xây dựng màn hình Đăng nhập mang phong cách thơ mộng Hà Nội (`app/(auth)/login.tsx`).
- Wizard 3 bước thiết lập dòng tiền (Thu nhập, Chi phí cố định, Mục tiêu tài chính lớn) (`app/(auth)/budget-setup.tsx`).
- Tích hợp Zustand store lưu trữ session và tính toán Ngân sách ngày đầu tiên trước khi mở Camera.
